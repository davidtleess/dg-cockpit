"""RED — the governed cadence-input artifact: how each fact was obtained.

WHY THIS SLICE EXISTS
    `feed_cadence` and the daily controller are shipped and green, but PFF and PlayerProfiler
    report `undetermined` because no governed calendar or per-stream inventory exists. That is the
    honest state, not the finished one. This slice builds the artifact that turns `undetermined`
    into a real cadence.

THE ONE IDEA THIS CONTRACT ENCODES: A FACT WITHOUT ITS ORIGIN IS NOT EVIDENCE.
    Every entry in the artifact must say HOW it was obtained, because the three kinds cannot be
    trusted the same way:

      DERIVED   — computed from a store we own. Must be RE-DERIVABLE: running the derivation again
                  must reproduce it, or the artifact has drifted from the data it claims to describe.
      DECLARED  — written by a human because no source exists. Must carry who/when, and must be
                  re-affirmable, because a declared fact rots silently while a derived one does not.
      OBSERVED  — recorded from a vendor at a moment in time. Must carry when and from what.

    Without this distinction a hand-typed season and a computed one look identical, and the first
    time a hand-typed one goes stale nothing detects it.

MEASURED SCOPE, established before writing this file:
  * HELD inventory IS derivable for 4 of 5 PlayerProfiler streams and all 14 PFF lanes.
  * `pp_player_season` is the exception: its key is COMPOSITE (`QB-2017`), so a naive season parse
    returns an EMPTY list SILENTLY — a derived fact that is confidently wrong. It gets its own case.
  * CALENDAR anchors are NOT derivable from anything we hold. Verified: zero matches for
    `week1_kickoff` / `regular_season_start` outside `feed_cadence`.
  * nflverse publishes a `schedules` dataset (catalogued B21) that is UNCAPTURED and absent from
    `build_streams`, so deriving the calendar would need a capture slice first.

THE CALENDAR SOURCE IS A ROUTE DECISION AND IS DELIBERATELY NOT MADE HERE. Hand-declare versus
capture-B21-and-derive is David's call. This contract is written to hold under EITHER: it requires
calendar anchors to carry provenance and, if DERIVED, to be re-derivable — which is exactly the
property that differs between the two routes and the reason the choice matters.

DELIBERATELY OUT OF SCOPE: any GREEN, any capture, any scheduler, provider contact, paid action, or
writing a production artifact into app/config. Building the artifact is a separate act from
defining what a valid one is.

The module under test does not exist. Every test that exercises it FAILS — it does not skip.
"""
from __future__ import annotations

import importlib
from datetime import datetime, timezone

import pytest

MODULE = "src.dynasty_genius.sources.cadence_inputs"

#: How a fact was obtained. A fourth kind would need its own trust rules, so the set is closed.
DERIVED, DECLARED, OBSERVED = "derived", "declared", "observed"
ORIGINS = frozenset({DERIVED, DECLARED, OBSERVED})


def _mod():
    try:
        return importlib.import_module(MODULE)
    except ModuleNotFoundError as exc:  # pragma: no cover - this IS the red state
        pytest.fail(f"{MODULE} does not exist yet (RED): {exc}")


def _at(iso: str) -> datetime:
    return datetime.fromisoformat(iso).astimezone(timezone.utc)


# ================== O1 — every fact declares its origin ============================


def test_o1_origin_vocabulary_is_closed():
    m = _mod()
    assert set(m.ORIGINS) == ORIGINS


def test_o2_a_fact_without_an_origin_is_REFUSED():
    """A hand-typed season and a computed one are indistinguishable without this, and the hand-typed
    one rots silently."""
    m = _mod()
    with pytest.raises(m.InputProvenanceError) as exc:
        m.build_artifact(
            calendar={"season": 2026, "week1_kickoff": "2026-09-10T20:20:00-04:00",
                      "final_game": "2027-01-04T20:20:00-05:00"},   # no origin
            now=_at("2026-08-08T09:00:00-04:00"),
        )
    assert "origin" in str(exc.value).lower()


@pytest.mark.parametrize("origin,required", [
    (DERIVED, "derivation"),      # what computed it, so it can be re-run
    (DECLARED, "declared_by"),    # who asserted it, so it can be re-affirmed
    (OBSERVED, "observed_at"),    # when it was seen, so staleness is visible
])
def test_o3_each_origin_carries_the_field_that_makes_it_checkable(origin, required):
    """The three origins are not interchangeable labels — each needs a DIFFERENT thing to be
    verifiable later, and omitting it makes the label decorative."""
    m = _mod()
    with pytest.raises(m.InputProvenanceError) as exc:
        m.validate_fact({"value": 2026, "origin": origin})
    assert required in str(exc.value)


# ================== D1 — derived facts must be RE-DERIVABLE ========================


def test_d1_a_derived_fact_that_no_longer_reproduces_is_STALE_not_valid():
    """The whole point of marking a fact derived: we can check it. If re-running the derivation
    yields something else, the artifact has drifted from the data it claims to describe."""
    m = _mod()
    fact = {"value": [2020, 2021], "origin": DERIVED, "derivation": "playerprofiler.gamelog.seasons"}
    result = m.reconcile_fact(fact, actual=[2020, 2021, 2022])
    assert result.stale is True
    assert result.expected == [2020, 2021] and result.actual == [2020, 2021, 2022]


def test_d1b_a_derived_fact_that_reproduces_is_fresh():
    m = _mod()
    fact = {"value": [2020, 2021], "origin": DERIVED, "derivation": "playerprofiler.gamelog.seasons"}
    assert m.reconcile_fact(fact, actual=[2020, 2021]).stale is False


def test_d2_the_COMPOSITE_KEY_trap_is_not_silently_empty():
    """MEASURED: `pp_player_season.block` holds values like `QB-2017`, so a naive integer parse
    returns an EMPTY list and the artifact would confidently record 'we hold no seasons'. An empty
    derivation from a NON-EMPTY source must be an error, not a result.
    """
    m = _mod()
    with pytest.raises(m.DerivationError) as exc:
        m.derive_seasons(["QB-2017", "QB-2018", "RB-2017"], parser=lambda v: int(v) if v.isdigit() else None)
    assert "empty" in str(exc.value).lower()
    # ...and the correct parser succeeds, so the guard is not simply refusing composite keys.
    assert m.derive_seasons(
        ["QB-2017", "QB-2018", "RB-2017"], parser=lambda v: int(v.rsplit("-", 1)[-1])
    ) == [2017, 2018]


# ================== C1 — calendar anchors, under EITHER route ======================


def test_c1_calendar_anchors_carry_provenance_whichever_route_supplies_them():
    """ROUTE-AGNOSTIC BY DESIGN. Hand-declaring the calendar and deriving it from a captured
    nflverse `schedules` dataset are both legitimate, and the choice is David's. What must hold
    either way is that each anchor says where it came from — that is precisely the property that
    differs between the routes."""
    m = _mod()
    for anchor in m.REQUIRED_CALENDAR_ANCHORS:
        with pytest.raises(m.InputProvenanceError):
            m.validate_calendar({anchor: {"value": "2026-09-10T20:20:00-04:00"}})  # no origin


def test_c1b_a_DECLARED_calendar_is_accepted_and_carries_its_author():
    m = _mod()
    art = m.validate_calendar({
        a: {"value": "2026-09-10T20:20:00-04:00", "origin": DECLARED,
            "declared_by": "david", "declared_at": "2026-08-08T09:00:00-04:00"}
        for a in m.REQUIRED_CALENDAR_ANCHORS
    })
    assert art is not None


def test_c1c_a_DERIVED_calendar_must_name_its_source_dataset():
    """If the route becomes capture-B21-and-derive, the anchor must say so — otherwise a derived
    calendar is indistinguishable from a typed one and loses its only advantage."""
    m = _mod()
    with pytest.raises(m.InputProvenanceError) as exc:
        m.validate_calendar({
            a: {"value": "2026-09-10T20:20:00-04:00", "origin": DERIVED}
            for a in m.REQUIRED_CALENDAR_ANCHORS
        })
    assert "derivation" in str(exc.value)


# ================== X1 — the artifact must satisfy the SHIPPED validator ===========


def test_x1_a_built_artifact_passes_daily_controls_validator():
    """END-TO-END. An artifact that this module considers valid but `daily_control._validate_inputs`
    rejects is worthless — the controller is the only consumer. This is asserted against the REAL
    shipped validator, not a copy of its rules."""
    m = _mod()
    daily_control = importlib.import_module("src.dynasty_genius.sources.daily_control")
    payload = m.build_artifact(
        calendar={
            a: {"value": v, "origin": DECLARED, "declared_by": "david",
                "declared_at": "2026-08-08T09:00:00-04:00"}
            for a, v in m.EXAMPLE_CALENDAR.items()
        },
        now=_at("2026-08-08T09:00:00-04:00"),
    ).as_controller_inputs()
    status, loaded, detail = daily_control._validate_inputs(payload)
    assert status == "ok", f"the shipped validator rejected our own artifact: {detail}"
    assert loaded is not None


def test_x1b_an_artifact_missing_coverage_evidence_is_refused_HERE_not_only_downstream():
    """The controller already rejects a held record without covered_seasons. Catching it at
    construction names the defect where it can be fixed, rather than at the consumer."""
    m = _mod()
    with pytest.raises(m.InputProvenanceError):
        m.build_artifact(
            calendar={a: {"value": v, "origin": DECLARED, "declared_by": "david",
                          "declared_at": "2026-08-08T09:00:00-04:00"}
                      for a, v in m.EXAMPLE_CALENDAR.items()},
            held={"pff": {"grades": {"ingested_at": "2026-08-01T00:00:00+00:00"}}},  # no coverage
            now=_at("2026-08-08T09:00:00-04:00"),
        )


# ================== S1 — staleness is reported, never repaired silently ============


def test_s1_a_stale_derived_fact_is_REPORTED_not_auto_corrected():
    """Silently rewriting a drifted fact would erase the evidence that it drifted. The artifact is a
    record of what we believed and when — correcting it in place destroys that."""
    m = _mod()
    report = m.audit_artifact(
        {"held": {"playerprofiler": {"gamelog": {
            "covered_seasons": {"value": [2020], "origin": DERIVED,
                                "derivation": "playerprofiler.gamelog.seasons"}}}}},
        actuals={"playerprofiler.gamelog.seasons": [2020, 2021]},
    )
    assert report.stale_facts, "drift must be reported"
    assert report.rewritten == [], "the artifact must not be silently corrected"


def test_s1b_a_DECLARED_fact_is_never_reported_stale_by_derivation():
    """Counter-test: a declared fact has no derivation to re-run, so it cannot drift by that
    mechanism. Reporting it stale here would be a category error and would train an operator to
    ignore the signal."""
    m = _mod()
    report = m.audit_artifact(
        {"calendar": {"week1_kickoff": {"value": "2026-09-10T20:20:00-04:00", "origin": DECLARED,
                                        "declared_by": "david",
                                        "declared_at": "2026-08-08T09:00:00-04:00"}}},
        actuals={},
    )
    assert report.stale_facts == []
