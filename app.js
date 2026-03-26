(function () {
  const CONFIG = {
    spreadsheetId: "1pe3GxVTe-3lTnitLRH3HHVbBWXVBtsCslng3_D3U0VM",
    scoringSheetName: "Data",
    apiBaseUrl: "",
    winchester: { lat: 39.1857, lon: -78.1633 },
    leadRadiusMiles: 25,
    metricOrder: ["forty", "broad", "cmj", "rsi", "pro", "cone", "trap", "pull"],
    metricLabels: {
      forty: "40-Yard Dash",
      broad: "Broad Jump",
      cmj: "CMJ Jump Height",
      rsi: "CMJ RSI-Mod",
      pro: "Pro Agility 5-10-5",
      cone: "3-Cone L-Drill",
      trap: "Trap Bar Strength",
      pull: "Pull-Ups"
    },
    metricMaxPoints: {
      forty: 30,
      broad: 15,
      cmj: 25,
      rsi: 15,
      pro: 20,
      cone: 20,
      trap: 15,
      pull: 10
    },
    scoreTiers: [
      { minScore: 120, tier: "Pro Level", projection: "High-level NCAA Division I trajectory", summary: "This score signals elite all-around combine ability for this peer group." },
      { minScore: 95, tier: "Elite", projection: "Strong NCAA Division I or Division II projection", summary: "This athlete is testing at a very competitive level and stands out in multiple categories." },
      { minScore: 70, tier: "Competitive", projection: "Division II, Division III, NAIA, or fast-rising varsity upside", summary: "This athlete has a solid testing base with clear upside and several college-relevant traits." },
      { minScore: 40, tier: "Developmental", projection: "Developmental varsity or college upside with growth", summary: "This athlete has a workable base with several measurable opportunities to improve." },
      { minScore: 0, tier: "Foundation Phase", projection: "Needs physical development", summary: "This athlete is still building the performance foundation." }
    ],
    momence: {
      hostId: "153795",
      fields: "firstName,lastName,email,zipCode",
      token: "BZ8lamv1XR",
      countryCode: "us",
      sourceId: "173704",
      fieldDef: "{\"firstName\":{\"type\":\"text\",\"label\":\"First name\",\"required\":true},\"lastName\":{\"type\":\"text\",\"label\":\"Last name\",\"required\":true},\"email\":{\"type\":\"email\",\"label\":\"Email\",\"required\":true},\"zipCode\":{\"type\":\"text\",\"label\":\"ZIP code\",\"required\":true,\"hidden\":false}}",
      scriptSrc: "https://momence.com/plugin/lead-form/lead-form.js"
    }
  };

  const state = {
    scoringTables: new Map(),
    pendingResult: null,
    gateContext: null,
    authMode: "login",
    currentUser: readSessionUser(),
    leadFormSubmitted: false,
    athleteResults: [],
    leaderboardRows: [],
    dashboardTab: "score",
    leaderboardView: "cards",
    progressComparisonMode: "previous"
  };

  const elements = {
    calculatorForm: document.getElementById("calculator-form"),
    athleteLoginButton: document.getElementById("athlete-login-button"),
    editProfileButton: document.getElementById("edit-profile-button"),
    resetButton: document.getElementById("reset-button"),
    saveDraftButton: document.getElementById("save-draft-button"),
    submitButton: document.getElementById("submit-button"),
    dataStatus: document.getElementById("data-status"),
    completionStatus: document.getElementById("completion-status"),
    heroLiveScore: document.getElementById("hero-live-score"),
    heroTier: document.getElementById("hero-tier"),
    heroProjection: document.getElementById("hero-projection"),
    totalScore: document.getElementById("total-score"),
    scoreProgressBar: document.getElementById("score-progress-bar"),
    tierName: document.getElementById("tier-name"),
    projectionName: document.getElementById("projection-name"),
    scoreExplainer: document.getElementById("score-explainer"),
    athleteResultName: document.getElementById("athlete-result-name"),
    comparisonCopy: document.getElementById("comparison-copy"),
    breakdownList: document.getElementById("breakdown-list"),
    gateModal: document.getElementById("gate-modal"),
    modalClose: document.getElementById("modal-close"),
    zipForm: document.getElementById("zip-form"),
    existingFasstButton: document.getElementById("existing-fasst-button"),
    newFasstButton: document.getElementById("new-fasst-button"),
    zipSubmitButton: document.getElementById("zip-submit-button"),
    zipInput: document.getElementById("zip-input"),
    existingAccountCheckbox: document.getElementById("existing-account-checkbox"),
    zipStatus: document.getElementById("zip-status"),
    leadStatus: document.getElementById("lead-status"),
    leadCreateAccountButton: document.getElementById("lead-create-account-button"),
    leadFormHost: document.getElementById("lead-form-host"),
    authForm: document.getElementById("auth-form"),
    authStatus: document.getElementById("auth-status"),
    authSubmit: document.getElementById("auth-submit"),
    registerFields: document.getElementById("register-fields"),
    loginTab: document.getElementById("login-tab"),
    registerTab: document.getElementById("register-tab"),
    scoreLockTriggers: Array.from(document.querySelectorAll(".score-lock-trigger")),
    profileModal: document.getElementById("profile-modal"),
    profileModalClose: document.getElementById("profile-modal-close"),
    profileCancelButton: document.getElementById("profile-cancel-button"),
    profileLogoutButton: document.getElementById("profile-logout-button"),
    profileForm: document.getElementById("profile-form"),
    profileSaveButton: document.getElementById("profile-save-button"),
    profileStatus: document.getElementById("profile-status"),
    athleteDashboard: document.getElementById("athlete-dashboard"),
    dashboardEmpty: document.getElementById("dashboard-empty"),
    downloadScorecardButton: document.getElementById("download-scorecard-button"),
    dashboardTabs: Array.from(document.querySelectorAll("[data-dashboard-tab]")),
    dashboardPanels: Array.from(document.querySelectorAll("[data-dashboard-panel]")),
    reportAthleteName: document.getElementById("report-athlete-name"),
    reportAthleteMeta: document.getElementById("report-athlete-meta"),
    reportOverallScore: document.getElementById("report-overall-score"),
    reportTierPill: document.getElementById("report-tier-pill"),
    reportRangeLabel: document.getElementById("report-range-label"),
    reportRangeTier: document.getElementById("report-range-tier"),
    reportScaleMarker: document.getElementById("report-scale-marker"),
    scoreSummaryList: document.getElementById("score-summary-list"),
    performanceBars: document.getElementById("performance-bars"),
    strengthsList: document.getElementById("strengths-list"),
    developmentList: document.getElementById("development-list"),
    tierTrack: document.getElementById("tier-track"),
    tierTrackCopy: document.getElementById("tier-track-copy"),
    progressSummary: document.getElementById("progress-summary"),
    historyList: document.getElementById("history-list"),
    progressPreviousButton: document.getElementById("progress-previous-button"),
    progressBaselineButton: document.getElementById("progress-baseline-button"),
    leaderboardSearch: document.getElementById("leaderboard-search"),
    leaderboardGenderFilter: document.getElementById("leaderboard-gender-filter"),
    leaderboardGradeFilter: document.getElementById("leaderboard-grade-filter"),
    leaderboardMinScore: document.getElementById("leaderboard-min-score"),
    leaderboardMaxScore: document.getElementById("leaderboard-max-score"),
    leaderboardCount: document.getElementById("leaderboard-count"),
    leaderboardCardsButton: document.getElementById("leaderboard-cards-button"),
    leaderboardTableButton: document.getElementById("leaderboard-table-button"),
    leaderboardCards: document.getElementById("leaderboard-cards"),
    leaderboardTableShell: document.getElementById("leaderboard-table-shell"),
    leaderboardTableBody: document.getElementById("leaderboard-table-body")
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    bindEvents();
    restoreDraft();
    renderEmptyState();
    syncScoreVisibility();
    syncLoginButtonState();
    hydrateFormFromUser();
    updateCompletionStatus(readFormPayload());
    renderPreview(readFormPayload());
    renderDashboard();

    try {
      const rows = await loadScoringRows();
      buildScoringTables(rows);
      elements.dataStatus.textContent = "Scoring tables ready. Results are compared only against the selected grade and gender.";
      elements.submitButton.disabled = false;
      renderPreview(readFormPayload());
    } catch (error) {
      console.error(error);
      elements.dataStatus.textContent = "Unable to load the scoring tables right now. Check the Google Sheet connection and try again.";
    }

    if (state.currentUser) {
      elements.dataStatus.textContent += ` Logged in as ${state.currentUser.email}.`;
      await refreshDashboardData();
    }
  }

  function bindEvents() {
    elements.calculatorForm.addEventListener("submit", handleCalculatorSubmit);
    elements.calculatorForm.addEventListener("input", handleLivePreview);
    elements.calculatorForm.addEventListener("change", handleLivePreview);
    elements.athleteLoginButton.addEventListener("click", handleAthleteLoginClick);
    elements.editProfileButton.addEventListener("click", handleEditProfileClick);
    elements.scoreLockTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleAthleteLoginClick);
    });
    elements.resetButton.addEventListener("click", handleReset);
    elements.saveDraftButton.addEventListener("click", handleSaveDraft);
    elements.zipForm.addEventListener("submit", handleZipSubmit);
    elements.existingFasstButton.addEventListener("click", handleExistingFasstClick);
    elements.newFasstButton.addEventListener("click", handleNewFasstClick);
    elements.authForm.addEventListener("submit", handleAuthSubmit);
    elements.authForm.addEventListener("keydown", handleFormEnterSubmit);
    elements.zipForm.addEventListener("keydown", handleFormEnterSubmit);
    elements.leadCreateAccountButton.addEventListener("click", handleLeadCreateAccount);
    elements.leadFormHost.addEventListener("submit", handleLeadFormSubmitCapture, true);
    elements.modalClose.addEventListener("click", closeModal);
    elements.gateModal.addEventListener("click", handleBackdropClick);
    elements.loginTab.addEventListener("click", () => setAuthMode("login"));
    elements.registerTab.addEventListener("click", () => setAuthMode("register"));
    elements.profileModalClose.addEventListener("click", closeProfileModal);
    elements.profileCancelButton.addEventListener("click", closeProfileModal);
    elements.profileLogoutButton.addEventListener("click", handleProfileLogoutClick);
    elements.profileModal.addEventListener("click", handleProfileBackdropClick);
    elements.profileForm.addEventListener("submit", handleProfileSubmit);
    elements.dashboardTabs.forEach((tab) => {
      tab.addEventListener("click", () => setDashboardTab(tab.dataset.dashboardTab));
    });
    elements.downloadScorecardButton.addEventListener("click", handleDownloadScorecard);
    elements.progressPreviousButton.addEventListener("click", () => setProgressComparisonMode("previous"));
    elements.progressBaselineButton.addEventListener("click", () => setProgressComparisonMode("baseline"));
    [elements.leaderboardSearch, elements.leaderboardGenderFilter, elements.leaderboardGradeFilter, elements.leaderboardMinScore, elements.leaderboardMaxScore].forEach((field) => {
      field.addEventListener("input", renderLeaderboard);
      field.addEventListener("change", renderLeaderboard);
    });
    elements.leaderboardCardsButton.addEventListener("click", () => setLeaderboardView("cards"));
    elements.leaderboardTableButton.addEventListener("click", () => setLeaderboardView("table"));
    elements.historyList.addEventListener("click", handleHistoryListClick);
  }

  function handleReset() {
    elements.calculatorForm.reset();
    localStorage.removeItem("fasstDraft");
    renderEmptyState();
    updateCompletionStatus(readFormPayload());
    elements.dataStatus.textContent = state.scoringTables.size > 0
      ? "Scoring tables ready. Results are compared only against the selected grade and gender."
      : "Loading scoring tables...";
  }

  function handleSaveDraft() {
    localStorage.setItem("fasstDraft", JSON.stringify(readFormPayload()));
    elements.dataStatus.textContent = "Draft saved on this device.";
  }

  function handleAthleteLoginClick() {
    state.gateContext = {
      zip: state.gateContext ? state.gateContext.zip : "",
      distanceMiles: null,
      localLeadRequired: false
    };
    openModal();
    showStep("athlete-check");
    updateInlineStatus(elements.zipStatus, "");
  }

  function handleExistingFasstClick() {
    state.gateContext = {
      zip: "",
      distanceMiles: null,
      localLeadRequired: false
    };
    setAuthMode("login");
    updateInlineStatus(elements.zipStatus, "");
    showStep("auth");
  }

  function handleNewFasstClick() {
    updateInlineStatus(elements.zipStatus, "");
    showStep("zip");
  }

  function handleAthleteLogoutClick() {
    state.currentUser = null;
    state.athleteResults = [];
    state.leaderboardRows = [];
    sessionStorage.removeItem("fasstCurrentUser");
    syncScoreVisibility();
    syncLoginButtonState();
    renderDashboard();
    closeModal();
    elements.dataStatus.textContent = state.scoringTables.size > 0
      ? "Logged out. Scoring tables are still loaded, but scores are hidden until login."
      : "Logged out.";
  }

  function handleProfileLogoutClick() {
    closeProfileModal();
    handleAthleteLogoutClick();
  }

  function handleEditProfileClick() {
    if (!state.currentUser) {
      handleAthleteLoginClick();
      return;
    }
    populateProfileForm();
    openProfileModal();
  }

  function handleLivePreview() {
    const payload = readFormPayload();
    updateCompletionStatus(payload);
    renderPreview(payload);
  }

  async function handleCalculatorSubmit(event) {
    event.preventDefault();

    const payload = readFormPayload();
    if (!isFormComplete(payload)) {
      elements.dataStatus.textContent = "Complete every required field before calculating the FASST score.";
      return;
    }

    const result = calculateScore(payload);
    if (result.errors.length > 0) {
      elements.dataStatus.textContent = result.errors.join(" ");
      return;
    }

    state.pendingResult = result;

    if (state.currentUser) {
      renderResult(result);
      await maybeSaveResult(result);
      state.pendingResult = null;
      elements.dataStatus.textContent = "Result saved to your athlete profile.";
      return;
    }

    state.gateContext = { zip: "", distanceMiles: null, localLeadRequired: false };
    openModal();
    showStep("athlete-check");
    resetGateStatus();
  }

  async function handleZipSubmit(event) {
    event.preventDefault();
    setButtonLoading(elements.zipSubmitButton, true, "Checking ZIP...");

    const zip = elements.zipInput.value.trim();
    if (!/^\d{5}(?:-\d{4})?$/.test(zip)) {
      setButtonLoading(elements.zipSubmitButton, false, "Continue");
      updateInlineStatus(elements.zipStatus, "Enter a valid US ZIP code.", true);
      return;
    }

    state.gateContext = { zip, distanceMiles: null, localLeadRequired: false };
    updateInlineStatus(elements.zipStatus, "Checking location...", false);

    if (elements.existingAccountCheckbox.checked) {
      state.gateContext = {
        zip,
        distanceMiles: null,
        localLeadRequired: false
      };
      setAuthMode("login");
      setButtonLoading(elements.zipSubmitButton, false, "Continue");
      updateInlineStatus(elements.zipStatus, "");
      showStep("auth");
      return;
    }

    if (state.currentUser) {
      setButtonLoading(elements.zipSubmitButton, false, "Continue");
      updateInlineStatus(elements.zipStatus, "");
      unlockPendingResult();
      return;
    }

    try {
      const location = await fetchZipLocation(zip);
      const distanceMiles = haversineMiles(location, CONFIG.winchester);
      state.gateContext.distanceMiles = distanceMiles;
      state.gateContext.localLeadRequired = distanceMiles <= CONFIG.leadRadiusMiles;

      if (state.gateContext.localLeadRequired) {
        mountLeadForm(zip);
        setButtonLoading(elements.zipSubmitButton, false, "Continue");
        showStep("lead");
      } else {
        setAuthMode("register");
        setButtonLoading(elements.zipSubmitButton, false, "Continue");
        showStep("auth");
      }
    } catch (error) {
      console.error(error);
      setButtonLoading(elements.zipSubmitButton, false, "Continue");
      updateInlineStatus(elements.zipStatus, "We could not verify that ZIP code. Please try another valid ZIP.", true);
    }
  }

  function handleLeadCreateAccount() {
    if (!state.leadFormSubmitted) {
      updateInlineStatus(elements.leadStatus, "Submit the lead form before creating an account.", true);
      return;
    }
    setAuthMode("register");
    updateInlineStatus(elements.authStatus, "");
    showStep("auth");
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const submitLabel = state.authMode === "register" ? "Creating Account..." : "Logging In...";
    setButtonLoading(elements.authSubmit, true, submitLabel);

    const formData = new FormData(elements.authForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const firstName = String(formData.get("firstName") || "").trim();
    const lastName = String(formData.get("lastName") || "").trim();

    if (!email || !password) {
      setAuthSubmitState();
      updateInlineStatus(elements.authStatus, "Enter an email and password.", true);
      return;
    }

    try {
      let user;
      if (state.authMode === "register") {
        if (!firstName || !lastName) {
          setAuthSubmitState();
          updateInlineStatus(elements.authStatus, "Enter first and last name to create an account.", true);
          return;
        }
        user = await registerUser({ firstName, lastName, email, password, zip: state.gateContext ? state.gateContext.zip : "" });
      } else {
        user = await loginUser({ email, password });
      }

      state.currentUser = user;
      persistSessionUser(user);
      syncScoreVisibility();
      syncLoginButtonState();
      hydrateFormFromUser();
      await refreshDashboardData();
      updateInlineStatus(elements.authStatus, `Welcome, ${user.firstName || user.email}.`, false, true);
      unlockPendingResult();
    } catch (error) {
      setAuthSubmitState();
      updateInlineStatus(elements.authStatus, error.message, true);
    }
  }

  function handleFormEnterSubmit(event) {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.tagName === "TEXTAREA") {
      return;
    }
    const form = event.currentTarget;
    if (form instanceof HTMLFormElement) {
      event.preventDefault();
      form.requestSubmit();
    }
  }

  function readFormPayload() {
    const formData = new FormData(elements.calculatorForm);
    return {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      gender: String(formData.get("gender") || "").trim(),
      grade: String(formData.get("grade") || "").trim(),
      forty: readNumber(formData.get("forty")),
      broad: readNumber(formData.get("broad")),
      cmj: readNumber(formData.get("cmj")),
      rsi: readNumber(formData.get("rsi")),
      pro: readNumber(formData.get("pro")),
      cone: readNumber(formData.get("cone")),
      bodyweight: readNumber(formData.get("bodyweight")),
      trapBar1RM: readNumber(formData.get("trapBar1RM")),
      pull: readNumber(formData.get("pull"))
    };
  }

  function isFormComplete(payload) {
    return Boolean(payload.gender && payload.grade) &&
      [payload.forty, payload.broad, payload.cmj, payload.rsi, payload.pro, payload.cone, payload.bodyweight, payload.trapBar1RM, payload.pull]
        .every((value) => value !== null);
  }

  function calculateScore(payload) {
    const errors = [];
    const trapRelative = payload.bodyweight > 0 ? payload.trapBar1RM / payload.bodyweight : null;
    const scoreEntries = [];

    CONFIG.metricOrder.forEach((metricKey) => {
      const rawValue = metricKey === "trap" ? trapRelative : payload[metricKey];
      const table = state.scoringTables.get(`${payload.gender}|${payload.grade}|${metricKey}`);
      if (!table) {
        errors.push(`Missing scoring table for ${CONFIG.metricLabels[metricKey]} (${payload.gender}, grade ${payload.grade}).`);
        return;
      }

      scoreEntries.push({
        metricKey,
        label: table.metricName || CONFIG.metricLabels[metricKey],
        hasValue: Number.isFinite(rawValue),
        points: scoreMetric(rawValue, table),
        maxPoints: table.maxPoints
      });
    });

    const totalScore = scoreEntries.reduce((sum, entry) => sum + entry.points, 0);
    const tierInfo = CONFIG.scoreTiers.find((tier) => totalScore >= tier.minScore) || CONFIG.scoreTiers[CONFIG.scoreTiers.length - 1];

    return {
      payload,
      trapRelative,
      scoreEntries,
      totalScore,
      tier: tierInfo.tier,
      projection: tierInfo.projection,
      explanation: `${tierInfo.summary} It helps frame current athletic profile, but it does not guarantee recruiting outcomes, scholarship offers, or roster placement.`,
      errors
    };
  }

  function scoreMetric(value, table) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    const thresholds = table.thresholds.slice().sort((a, b) => Number(a.order) - Number(b.order));
    if (table.direction === "lower_is_better") {
      const match = thresholds.find((threshold) => value <= threshold.cutoff);
      return match ? match.points : 0;
    }
    const match = thresholds.find((threshold) => value >= threshold.cutoff);
    return match ? match.points : 0;
  }

  function renderPreview(payload) {
    const hasPeerGroup = payload.gender && payload.grade;
    elements.athleteResultName.textContent = "Athlete";
    elements.comparisonCopy.textContent = hasPeerGroup ? buildComparisonCopy(payload) : "Compared against athletes in the selected peer group.";

    if (!hasPeerGroup || state.scoringTables.size === 0) {
      updateSummaryCards({ totalScore: 0, tier: "Foundation Phase", projection: "Needs physical development" });
      renderBreakdownPlaceholders();
      return;
    }

    const previewResult = calculateScore(payload);
    if (previewResult.errors.length > 0) {
      updateSummaryCards({ totalScore: 0, tier: "Foundation Phase", projection: "Needs physical development" });
      renderBreakdownPlaceholders();
      return;
    }

    updateSummaryCards(previewResult);
    renderBreakdown(previewResult.scoreEntries, true);
  }

  function renderResult(result) {
    updateSummaryCards(result);
    elements.athleteResultName.textContent = "Athlete";
    elements.comparisonCopy.textContent = buildComparisonCopy(result.payload);
    elements.scoreExplainer.textContent = result.explanation;
    renderBreakdown(result.scoreEntries, false);
  }

  function renderBreakdown(entries, useDashesForZero) {
    elements.breakdownList.innerHTML = "";
    entries.forEach((entry) => {
      const percentage = entry.maxPoints > 0 ? (entry.points / entry.maxPoints) * 100 : 0;
      const showDash = useDashesForZero && entry.points === 0 && entry.hasValue === false;
      const scoreLabel = showDash ? `- / ${entry.maxPoints}` : `${formatScore(entry.points)} / ${entry.maxPoints}`;
      const row = document.createElement("article");
      row.className = "breakdown-row";
      row.innerHTML = `<div class="breakdown-header"><strong>${escapeHtml(entry.label)}</strong><div class="breakdown-score">${scoreLabel}</div></div><div class="breakdown-bar"><div class="breakdown-fill" style="width:${percentage}%"></div></div>`;
      elements.breakdownList.appendChild(row);
    });
  }

  function renderBreakdownPlaceholders() {
    const placeholders = CONFIG.metricOrder.map((metricKey) => ({
      label: CONFIG.metricLabels[metricKey],
      hasValue: false,
      points: 0,
      maxPoints: CONFIG.metricMaxPoints[metricKey]
    }));
    renderBreakdown(placeholders, true);
  }

  function renderEmptyState() {
    elements.scoreExplainer.textContent = "This score is a performance benchmark. It does not guarantee recruiting outcomes, scholarship offers, or roster placement.";
    updateSummaryCards({ totalScore: 0, tier: "Foundation Phase", projection: "Needs physical development" });
    renderBreakdownPlaceholders();
  }

  async function refreshDashboardData() {
    if (!state.currentUser) {
      state.athleteResults = [];
      state.leaderboardRows = [];
      renderDashboard();
      return;
    }

    try {
      const [athleteResults, leaderboardRows] = await Promise.all([
        fetchAthleteResults(state.currentUser.id),
        fetchLeaderboardRows()
      ]);
      state.athleteResults = athleteResults;
      state.leaderboardRows = leaderboardRows;
    } catch (error) {
      console.error(error);
    }

    renderDashboard();
  }

  function renderDashboard() {
    if (!state.currentUser) {
      elements.dashboardEmpty.classList.remove("hidden");
      elements.dashboardPanels.forEach((panel) => panel.classList.remove("is-active"));
      return;
    }

    elements.dashboardEmpty.classList.toggle("hidden", state.athleteResults.length > 0);
    setDashboardTab(state.dashboardTab);
    renderMyScoreTab();
    renderProgressTab();
    renderLeaderboard();
    setLeaderboardView(state.leaderboardView);
  }

  function setDashboardTab(tabName) {
    state.dashboardTab = tabName;
    elements.dashboardTabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.dashboardTab === tabName);
    });
    elements.dashboardPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.dashboardPanel === tabName);
    });
  }

  function setLeaderboardView(view) {
    state.leaderboardView = view;
    elements.leaderboardCardsButton.classList.toggle("is-active", view === "cards");
    elements.leaderboardTableButton.classList.toggle("is-active", view === "table");
    elements.leaderboardCards.classList.toggle("hidden", view !== "cards");
    elements.leaderboardTableShell.classList.toggle("hidden", view !== "table");
  }

  function setProgressComparisonMode(mode) {
    state.progressComparisonMode = mode;
    elements.progressPreviousButton.classList.toggle("is-active", mode === "previous");
    elements.progressBaselineButton.classList.toggle("is-active", mode === "baseline");
    renderProgressTab();
  }

  function renderMyScoreTab() {
    const latest = getLatestResult();
    if (!latest) {
      elements.downloadScorecardButton.disabled = true;
      elements.reportAthleteName.textContent = state.currentUser.firstName || "Athlete";
      elements.reportAthleteMeta.textContent = "Submit your first result to unlock the report card.";
      elements.reportOverallScore.textContent = "0";
      elements.reportTierPill.textContent = "No scores yet";
      elements.reportRangeLabel.textContent = "FASST Score: 0 / 150";
      elements.reportRangeTier.textContent = "Foundation Phase";
      elements.reportScaleMarker.style.left = "0%";
      elements.scoreSummaryList.innerHTML = `<p class="data-status">No saved combine submission yet.</p>`;
      elements.performanceBars.innerHTML = `<p class="data-status">Performance visuals will appear after your first saved score.</p>`;
      elements.strengthsList.innerHTML = `<li>Submit a score to identify top categories.</li>`;
      elements.developmentList.innerHTML = `<li>Submit a score to surface development areas.</li>`;
      renderTierTrack(0);
      return;
    }

    elements.downloadScorecardButton.disabled = false;

    const athleteName = latest.athlete_name || [state.currentUser.firstName, state.currentUser.lastName].filter(Boolean).join(" ") || "Athlete";
    elements.reportAthleteName.textContent = athleteName;
    elements.reportAthleteMeta.textContent = `${formatGender(latest.gender)} • ${formatGrade(latest.grade)} • Latest saved ${formatDate(latest.date)}`;
    elements.reportOverallScore.textContent = Math.round(Number(latest.total_score || 0));
    elements.reportTierPill.textContent = latest.tier || "Foundation Phase";
    elements.reportRangeLabel.textContent = `FASST Score: ${formatScore(latest.total_score)} / 150`;
    elements.reportRangeTier.textContent = latest.tier || "Foundation Phase";
    elements.reportScaleMarker.style.left = `${Math.max(0, Math.min(100, (Number(latest.total_score || 0) / 150) * 100))}%`;

    const metricRows = buildMetricSummaryRows(latest);
    elements.scoreSummaryList.innerHTML = metricRows.map((metric) => `
      <div class="score-summary-row">
        <strong>${escapeHtml(metric.label)}</strong>
        <div class="score-summary-value">${escapeHtml(metric.value)} <span>/ ${metric.maxPoints} pts</span></div>
      </div>
    `).join("");

    const performance = buildPerformanceSnapshot(latest);
    elements.performanceBars.innerHTML = performance.map((item) => `
      <div class="performance-row">
        <div class="performance-row-label"><span>${escapeHtml(item.label)}</span><strong>${formatScore(item.score)}</strong></div>
        <div class="performance-track"><div class="performance-bar" style="width:${item.score}%"></div></div>
      </div>
    `).join("");

    const strengths = performance.slice().sort((a, b) => b.score - a.score).slice(0, 3);
    const development = performance.slice().sort((a, b) => a.score - b.score).slice(0, 3);
    elements.strengthsList.innerHTML = strengths.map((item) => `<li>${escapeHtml(item.label)} is trending strongest right now at ${formatScore(item.score)}.</li>`).join("");
    elements.developmentList.innerHTML = development.map((item) => `<li>${escapeHtml(item.label)} has the clearest room to improve next.</li>`).join("");
    renderTierTrack(Number(latest.total_score || 0));
  }

  function handleDownloadScorecard() {
    const latest = getLatestResult();
    if (!latest) {
      elements.dataStatus.textContent = "Save a result before exporting a scorecard PDF.";
      return;
    }

    const athleteName = latest.athlete_name || [state.currentUser.firstName, state.currentUser.lastName].filter(Boolean).join(" ") || "Athlete";
    const metricRows = buildMetricSummaryRows(latest);
    const performance = buildPerformanceSnapshot(latest);
    const strengths = performance.slice().sort((a, b) => b.score - a.score).slice(0, 3);
    const development = performance.slice().sort((a, b) => a.score - b.score).slice(0, 3);
    const printableHtml = buildPrintableScorecardHtml({
      athleteName,
      latest,
      metricRows,
      performance,
      strengths,
      development
    });

    const printWindow = window.open("", "_blank", "width=1080,height=1400");
    if (!printWindow) {
      elements.dataStatus.textContent = "Please allow pop-ups to download the scorecard PDF.";
      return;
    }

    try {
      printWindow.document.open();
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      elements.dataStatus.textContent = "Print dialog opened. Choose Save as PDF to download the scorecard.";
    } catch (error) {
      console.error(error);
      printWindow.close();
      const blob = new Blob([printableHtml], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      const fallbackWindow = window.open(blobUrl, "_blank");
      if (!fallbackWindow) {
        elements.dataStatus.textContent = "Please allow pop-ups to download the scorecard PDF.";
        return;
      }
      elements.dataStatus.textContent = "Scorecard opened in a new tab. Choose Print, then Save as PDF.";
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }
  }

  function renderTierTrack(score) {
    const tiers = [
      { label: "Foundation Phase", min: 0, icon: "icon-tier-foundation", iconClass: "" },
      { label: "Developmental", min: 40, icon: "icon-tier-developmental", iconClass: "" },
      { label: "Competitive", min: 70, icon: "icon-tier-competitive", iconClass: "tier-track-icon--outline" },
      { label: "Elite", min: 95, icon: "icon-tier-elite", iconClass: "" },
      { label: "Pro Level", min: 120, icon: "icon-tier-pro", iconClass: "tier-track-icon--outline" }
    ];
    const currentTier = getTierInfo(score).tier;
    elements.tierTrack.innerHTML = tiers.map((tier) => `
      <article class="tier-track-card ${tier.label === currentTier ? "is-current" : ""}">
        <svg class="tier-track-icon ${tier.iconClass}" viewBox="0 0 24 24"><use href="#${tier.icon}"></use></svg>
        <strong>${tier.label}</strong>
        <span>${tier.min}+ pts</span>
        ${tier.label === currentTier ? '<span class="current-pill">Current</span>' : ""}
      </article>
    `).join("");
    const nextTier = tiers.find((tier) => tier.min > score);
    elements.tierTrackCopy.textContent = nextTier
      ? `Current FASST score: ${formatScore(score)}/150. ${formatScore(nextTier.min - score)} points needed to reach ${nextTier.label}.`
      : `Current FASST score: ${formatScore(score)}/150. You are already in the top FASST tier.`;
  }

  function renderProgressTab() {
    const results = getSortedResultsDescending();
    if (results.length === 0) {
      elements.progressSummary.innerHTML = `<p class="data-status">Save results to unlock your progress timeline.</p>`;
      elements.historyList.innerHTML = "";
      return;
    }

    const latest = results[0];
    const comparisonResult = state.progressComparisonMode === "baseline" ? results[results.length - 1] : results[1];
    const comparisonLabel = state.progressComparisonMode === "baseline" ? "first saved baseline" : "previous saved result";
    const deltas = comparisonResult ? buildProgressDeltas(latest, comparisonResult) : [];
    elements.progressSummary.innerHTML = comparisonResult ? `
      <p class="data-status">Comparing your latest saved result from ${formatDate(latest.date)} against your ${comparisonLabel} from ${formatDate(comparisonResult.date)}.</p>
      <div class="progress-summary-row">
        <div class="progress-summary-label"><span>Total Score Change</span><strong>${signedScore(Number(latest.total_score || 0) - Number(comparisonResult.total_score || 0))}</strong></div>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${Math.min(100, Math.abs(Number(latest.total_score || 0) - Number(comparisonResult.total_score || 0)) * 4)}%"></div></div>
      </div>
      ${deltas.map((delta) => `
        <div class="progress-summary-row">
          <div class="progress-summary-label"><span>${escapeHtml(delta.label)}</span><strong>${escapeHtml(delta.value)}</strong></div>
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${Math.min(100, delta.magnitude)}%"></div></div>
        </div>
      `).join("")}
    ` : `<p class="data-status">One saved result so far. Save another submission to compare progress.</p>`;

    elements.historyList.innerHTML = results.map((result) => `
      <article class="history-item" data-result-id="${escapeHtml(result.result_id || result.id || "")}">
        <div class="history-head">
          <strong>${formatDateTimeET(result.date)}</strong>
          <div class="history-actions">
            <span>${formatScore(result.total_score)} / 150</span>
            <button type="button" class="delete-button" data-delete-result="${escapeHtml(result.result_id || result.id || "")}">Delete</button>
          </div>
        </div>
        <div class="history-meta">
          <span>${escapeHtml(result.tier || "Foundation Phase")}</span>
          <span>${escapeHtml(formatGender(result.gender))}</span>
          <span>${escapeHtml(formatGrade(result.grade))}</span>
        </div>
      </article>
    `).join("");
  }

  function renderLeaderboard() {
    const filteredRows = getFilteredLeaderboardRows();
    elements.leaderboardCount.textContent = `${filteredRows.length} athletes ranked`;
    elements.leaderboardCards.innerHTML = filteredRows.map((row, index) => {
      const rank = index + 1;
      return `
        <article class="leaderboard-card">
          <div class="leaderboard-card-top">
            <span class="leaderboard-rank ${rank <= 3 ? `leaderboard-rank--${rank}` : ""}">#${rank}</span>
            <div class="leaderboard-score"><strong>${Math.round(Number(row.total_score || 0))}</strong><span>score</span></div>
          </div>
          <div>
            <div class="leaderboard-card-name">${escapeHtml(row.athlete_name || "Athlete")}</div>
            <p class="leaderboard-card-copy">${escapeHtml(row.projection || "FASST athlete")}</p>
          </div>
          <div class="leaderboard-card-tags">
            <span class="leaderboard-tag">${escapeHtml(formatGrade(row.grade))}</span>
            <span class="leaderboard-tag">${escapeHtml(formatZipTag(row.zip))}</span>
            <span class="leaderboard-tag">${escapeHtml(formatGender(row.gender))}</span>
          </div>
          <div class="leaderboard-tier-bar" style="background:${tierColor(row.tier)}">${escapeHtml(row.tier || "Foundation Phase")}</div>
        </article>
      `;
    }).join("");

    elements.leaderboardTableBody.innerHTML = filteredRows.map((row, index) => `
      <tr>
        <td>#${index + 1}</td>
        <td>${escapeHtml(row.athlete_name || "Athlete")}</td>
        <td>${escapeHtml(formatGender(row.gender))}</td>
        <td>${escapeHtml(formatGrade(row.grade))}</td>
        <td>${formatScore(row.total_score)}</td>
        <td>${escapeHtml(row.tier || "Foundation Phase")}</td>
        <td>${escapeHtml(row.projection || "")}</td>
      </tr>
    `).join("");
  }

  function syncScoreVisibility() {
    document.body.classList.toggle("scores-locked", !state.currentUser);
  }

  function syncLoginButtonState() {
    if (!elements.athleteLoginButton) {
      return;
    }

    if (state.currentUser) {
      elements.athleteLoginButton.classList.add("hidden");
      elements.editProfileButton.classList.remove("hidden");
      elements.athleteDashboard.classList.remove("hidden");
    } else {
      elements.athleteLoginButton.classList.remove("hidden");
      elements.athleteLoginButton.textContent = "Log In/Sign Up";
      elements.athleteLoginButton.disabled = false;
      elements.editProfileButton.classList.add("hidden");
      elements.athleteDashboard.classList.add("hidden");
    }
  }

  function updateSummaryCards(result) {
    const formatted = formatScore(result.totalScore);
    elements.heroLiveScore.textContent = `${formatted} / 150`;
    elements.heroTier.textContent = result.tier;
    elements.heroProjection.textContent = result.projection;
    elements.totalScore.textContent = formatted;
    elements.tierName.textContent = result.tier;
    elements.projectionName.textContent = result.projection;
    elements.scoreProgressBar.style.width = `${Math.max(0, Math.min(100, (result.totalScore / 150) * 100))}%`;
    elements.scoreProgressBar.style.background = tierColor(result.tier);
  }

  function updateCompletionStatus(payload) {
    const completed = [payload.forty, payload.broad, payload.cmj, payload.rsi, payload.pro, payload.cone, payload.trapBar1RM, payload.pull]
      .filter((value) => value !== null).length;
    elements.completionStatus.textContent = `Fill in all 8 events to submit (${completed}/8 complete).`;
  }

  function buildComparisonCopy(payload) {
    const genderLabel = payload.gender === "boys" ? "boys" : payload.gender === "girls" ? "girls" : "athletes";
    const gradeLabel = { "9": "freshman", "10": "sophomore", "11": "junior", "12": "senior" }[payload.grade] || `grade ${payload.grade}`;
    return `Compared against ${genderLabel} in the ${gradeLabel} class.`;
  }

  function unlockPendingResult() {
    if (!state.pendingResult) {
      closeModal();
      return;
    }
    renderResult(state.pendingResult);
    void maybeSaveResult(state.pendingResult);
    document.dispatchEvent(new CustomEvent("fasst:result-unlocked", { detail: { result: state.pendingResult, gate: state.gateContext, user: state.currentUser } }));
    closeModal();
  }

  async function maybeSaveResult(result) {
    if (!state.currentUser) {
      return;
    }

    const record = buildResultRecord(result);

    if (CONFIG.apiBaseUrl) {
      try {
        await callApi("results", {
          method: "POST",
          body: record
        });
        elements.dataStatus.textContent = "Result saved to the live database.";
        await refreshDashboardData();
        return;
      } catch (error) {
        console.error(error);
        elements.dataStatus.textContent = "Live save failed, so this result was saved only on this device.";
      }
    }

    const history = readJson("fasstHistory", []);
    history.push(record);
    localStorage.setItem("fasstHistory", JSON.stringify(history));
    await refreshDashboardData();
  }

  async function fetchAthleteResults(userId) {
    if (!userId) {
      return [];
    }

    if (CONFIG.apiBaseUrl) {
      const payload = await callApi("results", {
        method: "GET",
        query: { user_id: userId }
      });
      return normalizeResults(payload.results || []);
    }

    const history = readJson("fasstHistory", []);
    return normalizeResults(history.filter((row) => String(row.user_id || row.userId) === String(userId)));
  }

  async function fetchLeaderboardRows() {
    if (CONFIG.apiBaseUrl) {
      const payload = await callApi("leaderboard", {
        method: "GET"
      });
      return normalizeResults(payload.results || []);
    }

    const history = readJson("fasstHistory", []);
    const bestByUser = new Map();
    normalizeResults(history).forEach((row) => {
      const userId = String(row.user_id || row.userId || row.athlete_name || row.result_id);
      const existing = bestByUser.get(userId);
      if (!existing || Number(row.total_score || 0) > Number(existing.total_score || 0)) {
        bestByUser.set(userId, row);
      }
    });
    return Array.from(bestByUser.values()).sort((a, b) => Number(b.total_score || 0) - Number(a.total_score || 0));
  }

  async function deleteSavedResult(resultId) {
    if (!resultId || !state.currentUser) {
      return;
    }

    if (CONFIG.apiBaseUrl) {
      await callApi("results/delete", {
        method: "POST",
        body: { result_id: resultId, user_id: state.currentUser.id }
      });
      return;
    }

    const history = readJson("fasstHistory", []);
    const nextHistory = history.filter((row) => String(row.result_id || row.id) !== String(resultId));
    localStorage.setItem("fasstHistory", JSON.stringify(nextHistory));
  }

  async function loadScoringRows() {
    if (CONFIG.apiBaseUrl) {
      const payload = await callApi("scoring", {
        method: "GET"
      });
      return payload.rows || [];
    }

    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.scoringSheetName)}`;
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) {
      throw new Error(`Scoring table request failed with status ${response.status}.`);
    }
    const text = await response.text();
    const payload = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const cols = payload.table.cols.map((col) => col.label);

    return payload.table.rows.map((row) => {
      const obj = {};
      row.c.forEach((cell, index) => {
        obj[cols[index]] = cell ? cell.v : "";
      });
      return obj;
    }).filter((row) => row.gender && row.grade && row.metric_key);
  }

  function buildScoringTables(rows) {
    rows.forEach((row) => {
      const key = `${String(row.gender).trim().toLowerCase()}|${String(row.grade).trim()}|${String(row.metric_key).trim().toLowerCase()}`;
      if (!state.scoringTables.has(key)) {
        state.scoringTables.set(key, {
          metricName: String(row.metric_name).trim(),
          maxPoints: Number(row.max_points),
          direction: String(row.scoring_direction).trim(),
          thresholds: []
        });
      }
      state.scoringTables.get(key).thresholds.push({
        cutoff: Number(row.cutoff_value),
        points: Number(row.awarded_points),
        order: Number(row.threshold_order)
      });
    });
  }

  async function fetchZipLocation(zip) {
    const response = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`, { credentials: "omit" });
    if (!response.ok) {
      throw new Error(`ZIP lookup failed with status ${response.status}.`);
    }
    const payload = await response.json();
    return {
      lat: Number(payload.places[0].latitude),
      lon: Number(payload.places[0].longitude)
    };
  }

  function haversineMiles(start, end) {
    const radiusKm = 6371;
    const latDelta = toRadians(end.lat - start.lat);
    const lonDelta = toRadians(end.lon - start.lon);
    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);
    const a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);
    return 2 * radiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.621371;
  }

  function toRadians(value) {
    return value * (Math.PI / 180);
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const isRegister = mode === "register";
    elements.registerFields.classList.toggle("hidden", !isRegister);
    elements.loginTab.classList.toggle("is-active", !isRegister);
    elements.registerTab.classList.toggle("is-active", isRegister);
    setAuthSubmitState();
    updateInlineStatus(elements.authStatus, "");
  }

  function setAuthSubmitState() {
    if (!elements.authSubmit) {
      return;
    }
    const label = state.authMode === "register" ? "Create Account" : "Log In";
    setButtonLoading(elements.authSubmit, false, label);
  }

  function setButtonLoading(button, isLoading, label) {
    if (!button) {
      return;
    }
    button.disabled = isLoading;
    button.classList.toggle("is-loading", isLoading);
    button.textContent = label;
  }

  function mountLeadForm(zip) {
    state.leadFormSubmitted = false;
    elements.leadCreateAccountButton.disabled = true;
    updateInlineStatus(elements.leadStatus, "Submit your information and create an account.");
    elements.leadFormHost.innerHTML = "";
    const mount = document.createElement("div");
    mount.id = "momence-plugin-lead-form";
    elements.leadFormHost.appendChild(mount);

    const script = document.createElement("script");
    script.async = true;
    script.type = "module";
    script.id = "momence-plugin-lead-form-src";
    script.setAttribute("host_id", CONFIG.momence.hostId);
    script.setAttribute("fields", CONFIG.momence.fields);
    script.setAttribute("token", CONFIG.momence.token);
    script.setAttribute("country_code", CONFIG.momence.countryCode);
    script.setAttribute("source_id", CONFIG.momence.sourceId);
    script.setAttribute("data-field-def", CONFIG.momence.fieldDef);
    script.src = CONFIG.momence.scriptSrc;
    elements.leadFormHost.appendChild(script);

    setTimeout(() => {
      const zipField = elements.leadFormHost.querySelector('input[name="zipCode"]');
      if (zipField) {
        zipField.value = zip;
      }
    }, 500);
  }

  function handleLeadFormSubmitCapture() {
    state.leadFormSubmitted = true;
    elements.leadCreateAccountButton.disabled = false;
    updateInlineStatus(elements.leadStatus, "Lead form submitted. Create your account to save and unlock results.", false, true);
  }

  function openModal() {
    elements.gateModal.classList.remove("hidden");
    elements.gateModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    elements.gateModal.classList.add("hidden");
    elements.gateModal.setAttribute("aria-hidden", "true");
  }

  function openProfileModal() {
    elements.profileModal.classList.remove("hidden");
    elements.profileModal.setAttribute("aria-hidden", "false");
    updateInlineStatus(elements.profileStatus, "");
  }

  function closeProfileModal() {
    elements.profileModal.classList.add("hidden");
    elements.profileModal.setAttribute("aria-hidden", "true");
  }

  function showStep(stepName) {
    document.querySelectorAll(".modal-step").forEach((step) => {
      step.classList.toggle("is-active", step.dataset.step === stepName);
    });
  }

  function resetGateStatus() {
    elements.zipForm.reset();
    setAuthMode("login");
    setButtonLoading(elements.zipSubmitButton, false, "Continue");
    state.leadFormSubmitted = false;
    elements.leadCreateAccountButton.disabled = true;
    updateInlineStatus(elements.leadStatus, "Submit your information and create an account.");
    updateInlineStatus(elements.zipStatus, "");
    updateInlineStatus(elements.authStatus, "");
  }

  function handleBackdropClick(event) {
    if (event.target instanceof HTMLElement && event.target.dataset.close === "true") {
      closeModal();
    }
  }

  function handleProfileBackdropClick(event) {
    if (event.target instanceof HTMLElement && event.target.dataset.profileClose === "true") {
      closeProfileModal();
    }
  }

  function updateInlineStatus(element, message, isError, isSuccess) {
    element.textContent = message || "";
    element.classList.toggle("is-error", Boolean(message) && Boolean(isError));
    element.classList.toggle("is-success", Boolean(message) && Boolean(isSuccess));
  }

  async function registerUser(userInput) {
    if (CONFIG.apiBaseUrl) {
      const user = await callApi("accounts/register", {
        method: "POST",
        body: userInput
      });
      return normalizeUser(user);
    }

    const users = readJson("fasstUsers", []);
    if (users.find((user) => user.email === userInput.email)) {
      throw new Error("An account with that email already exists. Log in instead.");
    }
    const user = { id: `user_${Date.now()}`, ...userInput };
    users.push(user);
    localStorage.setItem("fasstUsers", JSON.stringify(users));
    return user;
  }

  async function loginUser(credentials) {
    if (CONFIG.apiBaseUrl) {
      const user = await callApi("accounts/login", {
        method: "POST",
        body: credentials
      });
      return normalizeUser(user);
    }

    const users = readJson("fasstUsers", []);
    const user = users.find((entry) => entry.email === credentials.email && entry.password === credentials.password);
    if (!user) {
      throw new Error("We could not find a matching account for that email and password.");
    }
    return user;
  }

  async function updateUserProfile(profileInput) {
    if (CONFIG.apiBaseUrl) {
      const user = await callApi("accounts/profile", {
        method: "POST",
        body: profileInput
      });
      return normalizeUser(user);
    }

    const users = readJson("fasstUsers", []);
    const index = users.findIndex((entry) => entry.id === profileInput.user_id);
    if (index === -1) {
      throw new Error("We could not find that account to update.");
    }

    const nextUser = {
      ...users[index],
      firstName: profileInput.firstName,
      lastName: profileInput.lastName,
      email: profileInput.email,
      zip: profileInput.zip,
      gender: profileInput.gender,
      grade: profileInput.grade,
      height: profileInput.height,
      bodyweight: profileInput.bodyweight
    };

    if (profileInput.password) {
      nextUser.password = profileInput.password;
    }

    users[index] = nextUser;
    localStorage.setItem("fasstUsers", JSON.stringify(users));
    return normalizeUser(nextUser);
  }

  function persistSessionUser(user) {
    sessionStorage.setItem("fasstCurrentUser", JSON.stringify(user));
  }

  function readSessionUser() {
    return readJson("fasstCurrentUser", null, sessionStorage);
  }

  function restoreDraft() {
    const draft = readJson("fasstDraft", null);
    if (!draft) {
      return;
    }
    Object.entries(draft).forEach(([key, value]) => {
      const field = elements.calculatorForm.querySelector(`[name="${key}"]`);
      if (field && value !== null && value !== undefined) {
        field.value = value;
      }
    });
  }

  function populateProfileForm() {
    if (!elements.profileForm || !state.currentUser) {
      return;
    }
    const livePayload = readFormPayload();
    const profileValues = {
      firstName: state.currentUser.firstName || livePayload.firstName || "",
      lastName: state.currentUser.lastName || livePayload.lastName || "",
      height: state.currentUser.height || "",
      bodyweight: state.currentUser.bodyweight ?? livePayload.bodyweight ?? "",
      gender: state.currentUser.gender || livePayload.gender || "",
      grade: state.currentUser.grade || livePayload.grade || "",
      email: state.currentUser.email || "",
      password: ""
    };

    Object.entries(profileValues).forEach(([key, value]) => {
      const field = elements.profileForm.querySelector(`[name="${key}"]`);
      if (field) {
        field.value = value;
      }
    });
  }

  function hydrateFormFromUser() {
    if (!elements.calculatorForm || !state.currentUser) {
      return;
    }

    const fieldsToHydrate = {
      firstName: state.currentUser.firstName || "",
      lastName: state.currentUser.lastName || "",
      gender: state.currentUser.gender || "",
      grade: state.currentUser.grade || "",
      bodyweight: state.currentUser.bodyweight ?? ""
    };

    Object.entries(fieldsToHydrate).forEach(([key, value]) => {
      const field = elements.calculatorForm.querySelector(`[name="${key}"]`);
      if (field && (!field.value || key === "firstName" || key === "lastName")) {
        field.value = value;
      }
    });

    renderPreview(readFormPayload());
  }

  function readJson(key, fallbackValue, storage) {
    const source = storage || localStorage;
    try {
      const raw = source.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (error) {
      return fallbackValue;
    }
  }

  function readNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatScore(value) {
    return Number(value || 0).toFixed(1);
  }

  function buildResultRecord(result) {
    const pointsByMetric = Object.fromEntries(result.scoreEntries.map((entry) => [entry.metricKey, entry.points]));
    const athleteName = [result.payload.firstName, result.payload.lastName].filter(Boolean).join(" ");
    return {
      id: `score_${Date.now()}`,
      result_id: `score_${Date.now()}`,
      userId: state.currentUser.id,
      user_id: state.currentUser.id,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString(),
      athlete_name: athleteName,
      first_name: result.payload.firstName || "",
      last_name: result.payload.lastName || "",
      zip: state.gateContext ? state.gateContext.zip : "",
      gender: result.payload.gender,
      grade: result.payload.grade,
      bodyweight: result.payload.bodyweight,
      forty: result.payload.forty,
      broad: result.payload.broad,
      cmj: result.payload.cmj,
      rsi: result.payload.rsi,
      pro_agility: result.payload.pro,
      cone: result.payload.cone,
      trap_bar_1rm: result.payload.trapBar1RM,
      trap_relative: result.trapRelative,
      pull_ups: result.payload.pull,
      forty_points: pointsByMetric.forty || 0,
      broad_points: pointsByMetric.broad || 0,
      cmj_points: pointsByMetric.cmj || 0,
      rsi_points: pointsByMetric.rsi || 0,
      pro_points: pointsByMetric.pro || 0,
      cone_points: pointsByMetric.cone || 0,
      trap_points: pointsByMetric.trap || 0,
      pull_points: pointsByMetric.pull || 0,
      total_score: result.totalScore,
      tier: result.tier,
      projection: result.projection
    };
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    if (!state.currentUser) {
      closeProfileModal();
      handleAthleteLoginClick();
      return;
    }

    const formData = new FormData(elements.profileForm);
    const nextProfile = {
      user_id: state.currentUser.id,
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      height: String(formData.get("height") || "").trim(),
      bodyweight: readNumber(formData.get("bodyweight")),
      gender: String(formData.get("gender") || "").trim(),
      grade: String(formData.get("grade") || "").trim(),
      email: String(formData.get("email") || "").trim().toLowerCase(),
      password: String(formData.get("password") || ""),
      zip: state.currentUser.zip || (state.gateContext ? state.gateContext.zip : "")
    };

    if (!nextProfile.firstName || !nextProfile.lastName || !nextProfile.email || !nextProfile.gender || !nextProfile.grade) {
      updateInlineStatus(elements.profileStatus, "Complete the required profile fields before saving.", true);
      return;
    }

    elements.profileSaveButton.disabled = true;

    try {
      const updatedUser = await updateUserProfile(nextProfile);
      state.currentUser = updatedUser;
      persistSessionUser(updatedUser);
      syncLoginButtonState();
      hydrateFormFromUser();
      await refreshDashboardData();
      updateInlineStatus(elements.profileStatus, "Profile updated.", false, true);
      elements.dataStatus.textContent = "Profile updated successfully.";
      setTimeout(closeProfileModal, 450);
    } catch (error) {
      updateInlineStatus(elements.profileStatus, error.message, true);
    } finally {
      elements.profileSaveButton.disabled = false;
    }
  }

  async function handleHistoryListClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const resultId = target.dataset.deleteResult;
    if (!resultId) {
      return;
    }

    const confirmed = window.confirm("Delete this submission from your saved history?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteSavedResult(resultId);
      elements.dataStatus.textContent = "Submission deleted.";
      await refreshDashboardData();
    } catch (error) {
      elements.dataStatus.textContent = error.message;
    }
  }

  async function callApi(path, options) {
    const requestOptions = {
      method: options.method || "GET",
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    if (options.body) {
      requestOptions.headers = {
        "Content-Type": "text/plain;charset=utf-8"
      };
    }

    const response = await fetch(joinUrl(CONFIG.apiBaseUrl, path, options.query), requestOptions);

    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch (error) {
      payload = { raw: text };
    }

    if (!response.ok) {
      throw new Error(payload.error || `API request failed with status ${response.status}.`);
    }

    if (payload && payload.ok === false) {
      throw new Error(payload.error || "API request returned an application error.");
    }

    return payload;
  }

  function joinUrl(base, path, query) {
    const normalizedBase = String(base);
    const normalizedPath = String(path).replace(/^\/+/, "");
    const queryString = query ? new URLSearchParams(Object.entries(query).filter(([, value]) => value !== "" && value !== null && value !== undefined).map(([key, value]) => [key, String(value)])).toString() : "";

    if (normalizedBase.endsWith("=") || normalizedBase.includes("?route=")) {
      return `${normalizedBase}${normalizedPath}${queryString ? `&${queryString}` : ""}`;
    }

    return `${normalizedBase.replace(/\/+$/, "")}/${normalizedPath}${queryString ? `?${queryString}` : ""}`;
  }

  function normalizeResults(results) {
    return results.map((row) => ({
      ...row,
      result_id: row.result_id || row.id || "",
      athlete_name: row.athlete_name || [row.first_name || row.firstName || "", row.last_name || row.lastName || ""].filter(Boolean).join(" "),
      total_score: Number(row.total_score || 0),
      bodyweight: readNumber(row.bodyweight),
      forty: readNumber(firstDefined(row.forty, row.forty_yard_dash, row["40_yard_dash"])),
      broad: readNumber(firstDefined(row.broad, row.broad_jump)),
      cmj: readNumber(firstDefined(row.cmj, row.cmj_jump_height)),
      rsi: readNumber(firstDefined(row.rsi, row.cmj_rsi_mod)),
      pro_agility: readNumber(firstDefined(row.pro_agility, row.pro_agility_5_10_5, row.pro_agility_5_10_5_sec, row.pro_agility__5_10_5)),
      cone: readNumber(firstDefined(row.cone, row["3_cone_l_drill"])),
      trap_bar_1rm: readNumber(row.trap_bar_1rm),
      trap_relative: readNumber(firstDefined(row.trap_relative, row.trap_bar_relative)),
      pull_ups: readNumber(row.pull_ups),
      forty_points: readNumber(firstDefined(row.forty_points, row.forty_yard_dash_points, row["40_yard_dash_points"])) || 0,
      broad_points: readNumber(firstDefined(row.broad_points, row.broad_jump_points)) || 0,
      cmj_points: readNumber(firstDefined(row.cmj_points, row.cmj_jump_height_points)) || 0,
      rsi_points: readNumber(firstDefined(row.rsi_points, row.cmj_rsi_mod_points)) || 0,
      pro_points: readNumber(firstDefined(row.pro_points, row.pro_agility_points, row["pro_agility_points"])) || 0,
      cone_points: readNumber(firstDefined(row.cone_points, row["3_cone_l_drill_points"])) || 0,
      trap_points: readNumber(firstDefined(row.trap_points, row.trap_relative_points, row.trap_bar_relative_points, row.trap_bar_1rm_points)) || 0,
      pull_points: readNumber(firstDefined(row.pull_points, row.pull_ups_points)) || 0
    })).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }

  function firstDefined(...values) {
    const match = values.find((value) => value !== undefined && value !== null && value !== "");
    return match === undefined ? null : match;
  }

  function getLatestResult() {
    return getSortedResultsDescending()[0] || null;
  }

  function getSortedResultsDescending() {
    return state.athleteResults.slice().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }

  function buildMetricSummaryRows(result) {
    return [
      { label: "40-Yard Dash", value: formatMetricValue(getMetricValue(result, "forty"), "sec"), maxPoints: 30 },
      { label: "Broad Jump", value: formatMetricValue(result.broad, "in"), maxPoints: 15 },
      { label: "CMJ Jump Height", value: formatMetricValue(result.cmj, "in"), maxPoints: 25 },
      { label: "CMJ RSI-Mod", value: formatMetricValue(result.rsi), maxPoints: 15 },
      { label: "Pro Agility 5-10-5", value: formatMetricValue(result.pro_agility, "sec"), maxPoints: 20 },
      { label: "3-Cone L-Drill", value: formatMetricValue(result.cone, "sec"), maxPoints: 20 },
      { label: "Trap Bar 1RM", value: formatMetricValue(result.trap_bar_1rm, "lbs"), maxPoints: 15 },
      { label: "Pull-Ups", value: formatMetricValue(result.pull_ups, "reps"), maxPoints: 10 }
    ];
  }

  function buildPerformanceSnapshot(result) {
    const points = getDerivedMetricPoints(result);
    return [
      { label: "Speed", score: percentage(points.forty, 30) },
      { label: "Agility", score: average([percentage(points.pro, 20), percentage(points.cone, 20)]) },
      { label: "Power", score: average([percentage(points.broad, 15), percentage(points.cmj, 25)]) },
      { label: "Strength", score: percentage(points.trap, 15) },
      { label: "Conditioning", score: percentage(points.pull, 10) },
      { label: "Reactive Power", score: percentage(points.rsi, 15) }
    ];
  }

  function buildProgressDeltas(latest, previous) {
    return [
      buildDelta("40-Yard Dash", Number(previous.forty || 0) - Number(latest.forty || 0), true),
      buildDelta("Broad Jump", Number(latest.broad || 0) - Number(previous.broad || 0)),
      buildDelta("CMJ Jump Height", Number(latest.cmj || 0) - Number(previous.cmj || 0)),
      buildDelta("Pull-Ups", Number(latest.pull_ups || 0) - Number(previous.pull_ups || 0))
    ];
  }

  function buildDelta(label, rawDelta, isSeconds) {
    const magnitude = Math.min(100, Math.abs(rawDelta) * (isSeconds ? 140 : 12));
    return {
      label,
      value: `${rawDelta > 0 ? "+" : rawDelta < 0 ? "-" : ""}${formatDeltaNumber(Math.abs(rawDelta))}${isSeconds ? " sec" : ""}`,
      magnitude
    };
  }

  function getFilteredLeaderboardRows() {
    const search = elements.leaderboardSearch.value.trim().toLowerCase();
    const gender = elements.leaderboardGenderFilter.value;
    const grade = elements.leaderboardGradeFilter.value;
    const minScore = readNumber(elements.leaderboardMinScore.value);
    const maxScore = readNumber(elements.leaderboardMaxScore.value);

    return state.leaderboardRows
      .filter((row) => !search || String(row.athlete_name || "").toLowerCase().includes(search))
      .filter((row) => !gender || String(row.gender) === gender)
      .filter((row) => !grade || String(row.grade) === grade)
      .filter((row) => minScore === null || Number(row.total_score || 0) >= minScore)
      .filter((row) => maxScore === null || Number(row.total_score || 0) <= maxScore)
      .sort((a, b) => Number(b.total_score || 0) - Number(a.total_score || 0));
  }

  function getTierInfo(score) {
    return CONFIG.scoreTiers.find((tier) => score >= tier.minScore) || CONFIG.scoreTiers[CONFIG.scoreTiers.length - 1];
  }

  function getDerivedMetricPoints(result) {
    const payload = {
      gender: String(result.gender || "").trim(),
      grade: String(result.grade || "").trim(),
      forty: getMetricValue(result, "forty"),
      broad: result.broad,
      cmj: result.cmj,
      rsi: result.rsi,
      pro: result.pro_agility,
      cone: result.cone,
      bodyweight: result.bodyweight,
      trapBar1RM: result.trap_bar_1rm,
      pull: result.pull_ups
    };

    const canRecalculate = payload.gender && payload.grade && state.scoringTables.size > 0;
    if (!canRecalculate) {
      return {
        forty: result.forty_points || 0,
        broad: result.broad_points || 0,
        cmj: result.cmj_points || 0,
        rsi: result.rsi_points || 0,
        pro: result.pro_points || 0,
        cone: result.cone_points || 0,
        trap: result.trap_points || 0,
        pull: result.pull_points || 0
      };
    }

    const recalculated = calculateScore(payload);
    if (recalculated.errors.length > 0) {
      return {
        forty: result.forty_points || 0,
        broad: result.broad_points || 0,
        cmj: result.cmj_points || 0,
        rsi: result.rsi_points || 0,
        pro: result.pro_points || 0,
        cone: result.cone_points || 0,
        trap: result.trap_points || 0,
        pull: result.pull_points || 0
      };
    }

    return Object.fromEntries(recalculated.scoreEntries.map((entry) => [entry.metricKey, entry.points]));
  }

  function getMetricValue(result, key) {
    if (key === "forty") {
      return firstDefined(result.forty, result["40_yard_dash"]);
    }
    return result[key];
  }

  function percentage(value, max) {
    return max > 0 ? Math.max(0, Math.min(100, (Number(value || 0) / max) * 100)) : 0;
  }

  function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function valueOrPlaceholder(value) {
    return value === null || value === undefined || Number.isNaN(Number(value)) ? "Not recorded" : String(value);
  }

  function formatMetricValue(value, unit) {
    const normalized = valueOrPlaceholder(value);
    return normalized === "Not recorded" ? normalized : `${normalized}${unit ? ` ${unit}` : ""}`;
  }

  function formatDate(value) {
    if (!value) {
      return "Unknown date";
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateTimeET(value) {
    if (!value) {
      return "Unknown date";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    }).format(date);
  }

  function formatGender(value) {
    return value === "boys" ? "Male" : value === "girls" ? "Female" : "Athlete";
  }

  function formatGrade(value) {
    return { "9": "9th", "10": "10th", "11": "11th", "12": "12th" }[String(value)] || String(value || "Grade");
  }

  function formatZipTag(value) {
    const zip = String(value || "").trim();
    return zip ? zip.slice(0, 5) : "ZIP";
  }

  function tierColor(tier) {
    if (tier === "Pro Level") return "#f2b400";
    if (tier === "Elite") return "#1f6fe5";
    if (tier === "Competitive") return "#16c85c";
    if (tier === "Developmental") return "#ff8a00";
    return "#778194";
  }

  function tierColorForPercent(percent) {
    const normalized = Number(percent || 0);
    if (normalized >= 100) return "#f2b400";
    if (normalized >= 95) return "#1f6fe5";
    if (normalized >= 70) return "#16c85c";
    if (normalized >= 40) return "#ff8a00";
    return "#9aa6b8";
  }

  function signedScore(value) {
    return `${value > 0 ? "+" : value < 0 ? "-" : ""}${formatScore(Math.abs(value))} pts`;
  }

  function formatDeltaNumber(value) {
    return Number(value || 0).toFixed(value < 1 ? 2 : 1);
  }

  function buildPrintableScorecardHtml(data) {
    const scoreRows = data.metricRows.map((metric) => `
      <tr>
        <td>${escapeHtml(metric.label)}</td>
        <td>${escapeHtml(metric.value)}</td>
        <td>${metric.maxPoints} pts</td>
      </tr>
    `).join("");

    const performanceRows = data.performance.map((item) => `
      <div class="print-performance-row">
        <div class="print-performance-head">
          <span>${escapeHtml(item.label)}</span>
          <strong>${formatScore(item.score)}</strong>
        </div>
        <div class="print-performance-track"><div class="print-performance-fill" style="width:${item.score}%"></div></div>
      </div>
    `).join("");

    const strengths = data.strengths.map((item) => `<li>${escapeHtml(item.label)} is a current strength at ${formatScore(item.score)}.</li>`).join("");
    const development = data.development.map((item) => `<li>${escapeHtml(item.label)} is the clearest next development area.</li>`).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FASST Scorecard</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    * { box-sizing: border-box; }
    html, body, .sheet, .hero, .card, .pill, .scale, .seg1, .seg2, .seg3, .seg4, .seg5, .print-performance-fill {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body { margin: 0; font-family: "Barlow", "Arial", sans-serif; color: #101828; background: #f7fbff; }
    .sheet { display: grid; gap: 20px; }
    .hero { padding: 28px 32px; border-radius: 24px; color: #fff; background: linear-gradient(135deg, #05080f 0%, #0c1323 62%, #10182c 100%); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04); }
    .hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
    .eyebrow { margin: 0 0 12px; color: rgba(255,255,255,0.72); font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
    h1, h2 { font-family: "Barlow Condensed", "Arial Narrow", Arial, sans-serif; }
    h1 { margin: 0; font-size: 44px; line-height: 0.95; }
    .meta { margin: 12px 0 0; color: rgba(255,255,255,0.82); font-size: 18px; }
    .scorebox { text-align: right; }
    .scorebox strong { display: block; font-size: 72px; line-height: 0.9; }
    .scorebox span { color: rgba(255,255,255,0.72); font-size: 16px; }
    .pill { display: inline-flex; margin-top: 12px; padding: 10px 16px; border-radius: 999px; color: #fff; background: ${tierColor(data.latest.tier)}; font-weight: 700; }
    .range { margin-top: 22px; display: grid; gap: 10px; }
    .range-line { display: flex; gap: 12px; color: rgba(255,255,255,0.86); }
    .scale { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); height: 18px; border-radius: 999px; overflow: hidden; }
    .seg1 { background: #9da4bb; } .seg2 { background: #ff8a00; } .seg3 { background: #6bb691; } .seg4 { background: #5a91e8; } .seg5 { background: #f2b400; }
    .marker { position: absolute; top: 50%; left: ${Math.max(0, Math.min(100, (Number(data.latest.total_score || 0) / 150) * 100))}%; width: 14px; height: 14px; border: 3px solid #0d1528; border-radius: 999px; background: #fff; transform: translate(-50%, -50%); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .card { padding: 22px; border: 1px solid #d8e2ee; border-radius: 22px; background: #fff; break-inside: avoid; box-shadow: none; }
    .card h2 { margin: 0 0 14px; font-size: 24px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 15px; }
    td:last-child, td:nth-child(2) { text-align: right; }
    tr:last-child td { border-bottom: 0; }
    .print-performance-row { display: grid; gap: 8px; margin-bottom: 12px; }
    .print-performance-head { display: flex; justify-content: space-between; gap: 12px; font-weight: 700; }
    .print-performance-track { height: 10px; background: #edf2f7; border-radius: 999px; overflow: hidden; }
    .print-performance-fill { height: 100%; background: #16c85c; border-radius: 999px; }
    .card--success { background: #effdf5; border-color: #b6efcc; }
    .card--warning { background: #fff7ec; border-color: #ffd4a4; }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 10px; }
    .footer { color: #667383; font-size: 13px; text-align: center; }
    @media print {
      .print-hint { display: none; }
      body { background: #ffffff; }
      .sheet { gap: 16px; }
      a { color: inherit; text-decoration: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="print-hint" style="padding:12px 0;color:#667383;font-size:14px;">Choose “Save as PDF” in your browser print dialog to download this scorecard.</div>
    <section class="hero">
      <div class="hero-top">
        <div>
          <p class="eyebrow">FASST Athlete Report Card</p>
          <h1>${escapeHtml(data.athleteName)}</h1>
          <p class="meta">${escapeHtml(formatGender(data.latest.gender))} • ${escapeHtml(formatGrade(data.latest.grade))} • Saved ${escapeHtml(formatDateTimeET(data.latest.date))}</p>
        </div>
        <div class="scorebox">
          <strong>${Math.round(Number(data.latest.total_score || 0))}</strong>
          <span>Overall score (/ 150)</span>
          <div class="pill">${escapeHtml(data.latest.tier || "Foundation Phase")}</div>
        </div>
      </div>
      <div class="range">
        <div class="range-line"><span>FASST Score: ${formatScore(data.latest.total_score)} / 150</span><strong>${escapeHtml(data.latest.tier || "Foundation Phase")}</strong></div>
        <div class="scale">
          <div class="marker"></div>
          <div class="seg1"></div><div class="seg2"></div><div class="seg3"></div><div class="seg4"></div><div class="seg5"></div>
        </div>
      </div>
    </section>

    <div class="grid">
      <section class="card">
        <h2>Combine Results</h2>
        <table>
          <tbody>${scoreRows}</tbody>
        </table>
      </section>
      <section class="card">
        <h2>Performance Snapshot</h2>
        ${performanceRows}
      </section>
      <section class="card card--success">
        <h2>Strengths</h2>
        <ul>${strengths}</ul>
      </section>
      <section class="card card--warning">
        <h2>Development Areas</h2>
        <ul>${development}</ul>
      </section>
    </div>

    <div class="footer">FASST Combine Calculator • Generated ${escapeHtml(formatDateTimeET(new Date().toISOString()))}</div>
  </div>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () {
        window.print();
      }, 250);
    });
  </script>
</body>
</html>`;
  }

  function normalizeUser(user) {
    return {
      id: user.id || user.user_id || `user_${Date.now()}`,
      firstName: user.firstName || user.first_name || "",
      lastName: user.lastName || user.last_name || "",
      email: user.email || "",
      zip: user.zip || "",
      gender: user.gender || "",
      grade: user.grade || "",
      height: user.height || "",
      bodyweight: readNumber(user.bodyweight)
    };
  }

  const runtimeConfig = window.FASST_WIDGET_CONFIG || {};
  Object.assign(CONFIG, runtimeConfig);

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();
