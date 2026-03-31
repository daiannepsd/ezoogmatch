// Global app state
const State = {
  playerName: sessionStorage.getItem('ezoog_name') || null,
  currentSpecies: null,
  currentQuestions: [],
  currentQuestionIndex: 0,
  currentScore: 0,
  gameAnswers: [],

  setName(name) {
    this.playerName = name;
    sessionStorage.setItem('ezoog_name', name);
  },

  clearGame() {
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.currentScore = 0;
    this.gameAnswers = [];
  }
};
