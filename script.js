// VARIABLES GLOBALES
let matchInterval;
let currentTime = 0;
let addedTimeToShow = 3; // Minutes additionnelles configurables
let addedTimeCounter = 0;
let inAddedTime = false;
let goals = [];
let events = [];
let predictedEvents = [];
let currentScore1 = 0;
let currentScore2 = 0;
let halftimeScore1 = 0;
let halftimeScore2 = 0;
let corners1 = 0, corners2 = 0;
let shots1 = 0, shots2 = 0;
let yellowCards1 = 0, yellowCards2 = 0;
let fouls1 = 0, fouls2 = 0;

let targetCorners1, targetCorners2;
let targetShots1, targetShots2;
let targetYellowCards1, targetYellowCards2;
let targetFouls1, targetFouls2;
let goalCounter = 0;
let eventCounter = 0;
let halftimeShown = false;

// GESTION DES ÉQUIPES
document.getElementById('team1').addEventListener('input', function() {
    document.getElementById('statsTeamName1').textContent = this.value || 'Équipe 1';
    updateTeamNamesInGoals();
    updateTeamNamesInEvents();
});

document.getElementById('team2').addEventListener('input', function() {
    document.getElementById('statsTeamName2').textContent = this.value || 'Équipe 2';
    updateTeamNamesInGoals();
    updateTeamNamesInEvents();
});

document.getElementById('score1').addEventListener('input', updateGoalsFromScore);
document.getElementById('score2').addEventListener('input', updateGoalsFromScore);

function updateTeamNamesInGoals() {
    const team1Name = document.getElementById('team1').value || 'Équipe 1';
    const team2Name = document.getElementById('team2').value || 'Équipe 2';
    
    document.querySelectorAll('.team-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="1">${team1Name}</option>
            <option value="2">${team2Name}</option>
        `;
        select.value = currentValue;
    });
}

function updateTeamNamesInEvents() {
    const team1Name = document.getElementById('team1').value || 'Équipe 1';
    const team2Name = document.getElementById('team2').value || 'Équipe 2';
    
    document.querySelectorAll('.event-team-select').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = `
            <option value="1">${team1Name}</option>
            <option value="2">${team2Name}</option>
        `;
        select.value = currentValue;
    });
}

// GESTION DES BUTS
function addGoal(team = 1, minute = 15) {
    goalCounter++;
    const team1Name = document.getElementById('team1').value || 'Équipe 1';
    const team2Name = document.getElementById('team2').value || 'Équipe 2';
    
    const goalItem = document.createElement('div');
    goalItem.className = 'goal-item';
    goalItem.id = `goal-${goalCounter}`;
    
    goalItem.innerHTML = `
        <label>But ${goalCounter}</label>
        <select class="team-select" id="team-${goalCounter}">
            <option value="1" ${team === 1 ? 'selected' : ''}>${team1Name}</option>
            <option value="2" ${team === 2 ? 'selected' : ''}>${team2Name}</option>
        </select>
        <input type="number" id="minute-${goalCounter}" min="1" max="90" value="${minute}" placeholder="Minute">
        <input type="text" id="scorer-${goalCounter}" placeholder="Buteur (optionnel)">
        <button type="button" class="remove-goal" onclick="removeGoal(${goalCounter})">×</button>
    `;
    
    document.getElementById('goalsList').appendChild(goalItem);
}

function removeGoal(goalId) {
    const goalItem = document.getElementById(`goal-${goalId}`);
    if (goalItem) {
        goalItem.remove();
    }
}

// GESTION DES ÉVÉNEMENTS
function addEvent(type = 'yellow', team = 1, minute = 30) {
    eventCounter++;
    const team1Name = document.getElementById('team1').value || 'Équipe 1';
    const team2Name = document.getElementById('team2').value || 'Équipe 2';
    
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    eventItem.id = `event-${eventCounter}`;
    
    eventItem.innerHTML = `
        <label>Evt ${eventCounter}</label>
        <select class="event-type-select" id="eventType-${eventCounter}">
            <option value="yellow" ${type === 'yellow' ? 'selected' : ''}>🟨 Carton Jaune</option>
            <option value="substitution" ${type === 'substitution' ? 'selected' : ''}>🔄 Changement</option>
        </select>
        <select class="event-team-select" id="eventTeam-${eventCounter}">
            <option value="1" ${team === 1 ? 'selected' : ''}>${team1Name}</option>
            <option value="2" ${team === 2 ? 'selected' : ''}>${team2Name}</option>
        </select>
        <input type="number" id="eventMinute-${eventCounter}" min="1" max="90" value="${minute}" placeholder="Minute">
        <button type="button" class="remove-event" onclick="removeEvent(${eventCounter})">×</button>
    `;
    
    document.getElementById('eventsList').appendChild(eventItem);
}

function removeEvent(eventId) {
    const eventItem = document.getElementById(`event-${eventId}`);
    if (eventItem) {
        eventItem.remove();
    }
}

function updateGoalsFromScore() {
    const score1 = parseInt(document.getElementById('score1').value) || 0;
    const score2 = parseInt(document.getElementById('score2').value) || 0;
    const totalGoals = score1 + score2;
    const currentGoals = document.querySelectorAll('.goal-item').length;
    
    if (totalGoals > currentGoals) {
        let team1Goals = 0;
        let team2Goals = 0;
        
        document.querySelectorAll('.team-select').forEach(select => {
            if (select.value === '1') team1Goals++;
            else team2Goals++;
        });
        
        for (let i = currentGoals; i < totalGoals; i++) {
            let teamToAdd = 1;
            if (team1Goals < score1) {
                teamToAdd = 1;
                team1Goals++;
            } else {
                teamToAdd = 2;
                team2Goals++;
            }
            addGoal(teamToAdd, 15 + i * 15);
        }
    }
    
    if (totalGoals < currentGoals) {
        const goalsToRemove = currentGoals - totalGoals;
        const allGoals = document.querySelectorAll('.goal-item');
        for (let i = 0; i < goalsToRemove; i++) {
            if (allGoals[allGoals.length - 1 - i]) {
                allGoals[allGoals.length - 1 - i].remove();
            }
        }
    }
}

// FONCTION PRINCIPALE DE LANCEMENT
function launchPrediction() {
    const competition = document.getElementById('competition').value || 'Compétition';
    const team1 = document.getElementById('team1').value || 'Équipe 1';
    const team2 = document.getElementById('team2').value || 'Équipe 2';
    
    // Récupération du temps additionnel configuré
    addedTimeToShow = parseInt(document.getElementById('addedTimeMinutes').value) || 3;

    // Récupération des prédictions
    targetCorners1 = parseInt(document.getElementById('predCorners1').value) || 0;
    targetCorners2 = parseInt(document.getElementById('predCorners2').value) || 0;
    targetShots1 = parseInt(document.getElementById('predShots1').value) || 0;
    targetShots2 = parseInt(document.getElementById('predShots2').value) || 0;
    targetYellowCards1 = parseInt(document.getElementById('predYellowCards1').value) || 0;
    targetYellowCards2 = parseInt(document.getElementById('predYellowCards2').value) || 0;
    targetFouls1 = parseInt(document.getElementById('predFouls1').value) || 0;
    targetFouls2 = parseInt(document.getElementById('predFouls2').value) || 0;

    // Reset des variables
    currentTime = 0;
    addedTimeCounter = 0;
    inAddedTime = false;
    currentScore1 = 0;
    currentScore2 = 0;
    halftimeScore1 = 0;
    halftimeScore2 = 0;
    halftimeShown = false;
    corners1 = 0; corners2 = 0;
    shots1 = 0; shots2 = 0;
    yellowCards1 = 0; yellowCards2 = 0;
    fouls1 = 0; fouls2 = 0;
    goals = [];
    events = [];
    predictedEvents = [];

    generateGoals();
    generateEvents();
    generatePredictedEvents();

    // Changement d'écran
    document.getElementById('predictionForm').style.display = 'none';
    document.getElementById('matchDisplay').style.display = 'flex';
    
    // Mise à jour de l'affichage
    document.getElementById('competitionDisplay').textContent = competition;
    document.getElementById('displayTeam1').textContent = team1;
    document.getElementById('displayTeam2').textContent = team2;
    document.getElementById('statsTeam1').textContent = team1;
    document.getElementById('statsTeam2').textContent = team2;
    
    document.getElementById('displayScore1').textContent = '0';
    document.getElementById('displayScore2').textContent = '0';
    document.getElementById('matchTime').textContent = "0'";
    document.getElementById('addedTime').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('halftimeScore').style.display = 'none';
    updateStats();

    matchInterval = setInterval(updateMatch, 600);
}

// GÉNÉRATION DES BUTS
function generateGoals() {
    goals = [];
    
    document.querySelectorAll('.goal-item').forEach((goalItem, index) => {
        const teamSelect = goalItem.querySelector('.team-select');
        const minuteInput = goalItem.querySelector('input[type="number"]');
        const scorerInput = goalItem.querySelector('input[type="text"]');
        
        if (teamSelect && minuteInput) {
            const team = parseInt(teamSelect.value);
            const minute = parseInt(minuteInput.value) || (15 + index * 15);
            const scorer = scorerInput ? scorerInput.value : '';
            goals.push({ 
                team: team, 
                minute: Math.min(90, Math.max(1, minute)),
                scorer: scorer
            });
        }
    });
    
    goals.sort((a, b) => a.minute - b.minute);
}

// GÉNÉRATION DES ÉVÉNEMENTS
function generateEvents() {
    events = [];
    
    document.querySelectorAll('.event-item').forEach((eventItem, index) => {
        const typeSelect = eventItem.querySelector('.event-type-select');
        const teamSelect = eventItem.querySelector('.event-team-select');
        const minuteInput = eventItem.querySelector('input[type="number"]');
        
        if (typeSelect && teamSelect && minuteInput) {
            const type = typeSelect.value;
            const team = parseInt(teamSelect.value);
            const minute = parseInt(minuteInput.value) || (30 + index * 20);
            
            events.push({
                type: type,
                team: team,
                minute: Math.min(90, Math.max(1, minute))
            });
        }
    });
    
    events.sort((a, b) => a.minute - b.minute);
}

// GÉNÉRATION DES ÉVÉNEMENTS PRÉDITS
function generatePredictedEvents() {
    predictedEvents = [];
    
    // Distribution intelligente des corners
    for (let i = 0; i < targetCorners1; i++) {
        const minute = Math.floor((i + 1) * (90 / (targetCorners1 + 1))) + Math.floor(Math.random() * 10) - 5;
        predictedEvents.push({
            type: 'corner',
            team: 1,
            minute: Math.max(1, Math.min(89, minute))
        });
    }
    for (let i = 0; i < targetCorners2; i++) {
        const minute = Math.floor((i + 1) * (90 / (targetCorners2 + 1))) + Math.floor(Math.random() * 10) - 5;
        predictedEvents.push({
            type: 'corner',
            team: 2,
            minute: Math.max(1, Math.min(89, minute))
        });
    }
    
    // Distribution des tirs cadrés
    for (let i = 0; i < targetShots1; i++) {
        predictedEvents.push({
            type: 'shot',
            team: 1,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    for (let i = 0; i < targetShots2; i++) {
        predictedEvents.push({
            type: 'shot',
            team: 2,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    
    // Distribution des cartons jaunes automatiques
    for (let i = 0; i < targetYellowCards1; i++) {
        predictedEvents.push({
            type: 'auto_yellow_card',
            team: 1,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    for (let i = 0; i < targetYellowCards2; i++) {
        predictedEvents.push({
            type: 'auto_yellow_card',
            team: 2,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    
    // Distribution des fautes
    for (let i = 0; i < targetFouls1; i++) {
        predictedEvents.push({
            type: 'foul',
            team: 1,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    for (let i = 0; i < targetFouls2; i++) {
        predictedEvents.push({
            type: 'foul',
            team: 2,
            minute: Math.floor(Math.random() * 89) + 1
        });
    }
    
    predictedEvents.sort((a, b) => a.minute - b.minute);
}

// CÉLÉBRATION DE BUT SIMPLIFIÉE (2 SECONDES MAX)
function showGoalCelebration(team, scorer = '') {
    const celebration = document.getElementById('goalCelebration');
    const goalTeamElement = document.getElementById('goalTeamName');
    const teamName = team === 1 ? 
        document.getElementById('displayTeam1').textContent : 
        document.getElementById('displayTeam2').textContent;
    
    let displayText = teamName;
    if (scorer) {
        displayText += ` (${scorer})`;
    }
    
    goalTeamElement.textContent = displayText;
    celebration.style.display = 'flex';
    
    createSimpleConfetti();

    setTimeout(() => {
        celebration.style.display = 'none';
        const confettis = celebration.querySelectorAll('.confetti');
        confettis.forEach(confetti => confetti.remove());
    }, 2000);
}

// CÉLÉBRATION D'ÉVÉNEMENT (1 SECONDE MAX)
function showEventCelebration(eventType, team) {
    const celebration = document.getElementById('eventCelebration');
    const eventText = document.getElementById('eventText');
    const teamName = team === 1 ? 
        document.getElementById('displayTeam1').textContent : 
        document.getElementById('displayTeam2').textContent;
    
    let text = '';
    switch(eventType) {
        case 'yellow':
            text = `🟨 Carton Jaune - ${teamName}`;
            break;
        case 'substitution':
            text = `🔄 Changement - ${teamName}`;
            break;
    }
    
    eventText.textContent = text;
    celebration.style.display = 'block';
    
    setTimeout(() => {
        celebration.style.display = 'none';
    }, 1000);
}

// CRÉATION DES CONFETTIS SIMPLIFIÉE
function createSimpleConfetti() {
    const celebration = document.getElementById('goalCelebration');
    const colors = ['#ff6b35', '#f7931e', '#1a2f5a', '#2c4875', '#4a6fa5', '#ffffff'];
    
    let confettiContainer = celebration.querySelector('.confetti-container');
    if (!confettiContainer) {
        confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        celebration.appendChild(confettiContainer);
    }
    
    // Confettis optimisés pour mobile
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 0.5 + 1.5) + 's';
        
        confettiContainer.appendChild(confetti);
    }
}

// MISE À JOUR DU MATCH AVEC TEMPS ADDITIONNEL CONFIGURABLE
function updateMatch() {
    if (!inAddedTime) {
        currentTime++;
        document.getElementById('matchTime').textContent = currentTime + "'";
        document.getElementById('progressFill').style.width = (currentTime / 90) * 100 + '%';
    } else {
        addedTimeCounter++;
        // Le temps additionnel n'est affiché que pendant 5 secondes
        if (addedTimeCounter <= 5) {
            document.getElementById('addedTime').textContent = '+' + addedTimeToShow;
        }
    }

    // Affichage du score mi-temps à la 45e minute
    if (currentTime === 45 && !halftimeShown) {
        halftimeScore1 = currentScore1;
        halftimeScore2 = currentScore2;
        document.getElementById('halftimeScore').textContent = `MI-TEMPS: ${halftimeScore1}-${halftimeScore2}`;
        document.getElementById('halftimeScore').style.display = 'block';
        halftimeShown = true;
    }

    // Début du temps additionnel à 90 minutes
    if (currentTime === 90 && !inAddedTime) {
        inAddedTime = true;
        addedTimeCounter = 0;
        document.getElementById('addedTime').style.display = 'block';
        document.getElementById('addedTime').textContent = '+' + addedTimeToShow;
    }

    // Gestion des buts
    goals.forEach(goal => {
        if (goal.minute === currentTime && !goal.displayed) {
            if (goal.team === 1) {
                currentScore1++;
                document.getElementById('displayScore1').textContent = currentScore1;
                showGoalCelebration(1, goal.scorer);
            } else {
                currentScore2++;
                document.getElementById('displayScore2').textContent = currentScore2;
                showGoalCelebration(2, goal.scorer);
            }
            goal.displayed = true;
        }
    });

    // Gestion des événements personnalisés
    events.forEach(event => {
        if (event.minute === currentTime && !event.displayed) {
            switch(event.type) {
                case 'yellow':
                    if (event.team === 1) yellowCards1++; else yellowCards2++;
                    showEventCelebration('yellow', event.team);
                    updateStats();
                    break;
                case 'substitution':
                    showEventCelebration('substitution', event.team);
                    break;
            }
            event.displayed = true;
        }
    });

    // Gestion des événements automatiques
    predictedEvents.forEach(event => {
        if (event.minute === currentTime && !event.displayed) {
            switch(event.type) {
                case 'corner':
                    if (event.team === 1) corners1++; else corners2++;
                    updateStats();
                    break;
                case 'shot':
                    if (event.team === 1) shots1++; else shots2++;
                    updateStats();
                    break;
                case 'auto_yellow_card':
                    if (event.team === 1) yellowCards1++; else yellowCards2++;
                    updateStats();
                    break;
                case 'foul':
                    if (event.team === 1) fouls1++; else fouls2++;
                    updateStats();
                    break;
            }
            event.displayed = true;
        }
    });

    // Fin du match après 5 secondes de temps additionnel
    if (inAddedTime && addedTimeCounter >= 5) {
        clearInterval(matchInterval);
        document.getElementById('matchTime').textContent = "FIN";
        document.getElementById('addedTime').style.display = 'none';
        document.getElementById('progressFill').style.width = '100%';
    }
}

// MISE À JOUR DES STATISTIQUES
function updateStats() {
    document.getElementById('corners1').textContent = corners1;
    document.getElementById('corners2').textContent = corners2;
    document.getElementById('shots1').textContent = shots1;
    document.getElementById('shots2').textContent = shots2;
    document.getElementById('yellowCards1').textContent = yellowCards1;
    document.getElementById('yellowCards2').textContent = yellowCards2;
    document.getElementById('fouls1').textContent = fouls1;
    document.getElementById('fouls2').textContent = fouls2;
}

// RESET DE LA PRÉDICTION
function resetPrediction() {
    if (matchInterval) {
        clearInterval(matchInterval);
    }
    
    document.getElementById('predictionForm').style.display = 'block';
    document.getElementById('matchDisplay').style.display = 'none';
    document.getElementById('goalCelebration').style.display = 'none';
    document.getElementById('eventCelebration').style.display = 'none';
}

// INITIALISATION
function initializeApp() {
    // Buts par défaut
    addGoal(1, 25);
    addGoal(1, 65);
    addGoal(2, 80);

    // Événements par défaut
    addEvent('yellow', 1, 35);
    addEvent('substitution', 2, 60);
}

// PRÉVENTION DU SCROLL SUR MOBILE LORS DE LA SIMULATION
let isSimulationMode = false;

function preventScroll(e) {
    if (isSimulationMode) {
        e.preventDefault();
    }
}

// Observer pour détecter le changement de mode
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.target.id === 'matchDisplay') {
            isSimulationMode = mutation.target.style.display === 'flex';
            if (isSimulationMode) {
                document.body.style.overflow = 'hidden';
                document.addEventListener('touchmove', preventScroll, { passive: false });
            } else {
                document.body.style.overflow = '';
                document.removeEventListener('touchmove', preventScroll);
            }
        }
    });
});

// LANCEMENT DE L'APPLICATION
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Observer les changements d'affichage
    observer.observe(document.getElementById('matchDisplay'), {
        attributes: true,
        attributeFilter: ['style']
    });
});
