let quizData;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // START, PLAYING, END

let questionText, feedbackText;
let buttons = [];
let startButton, restartButton;

// 在 preload() 中載入 CSV 檔案
function preload() {
  quizData = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(20);

  // 創建 UI 元素
  questionText = createP('').id('question');
  feedbackText = createP('').id('feedback');
  
  startButton = createButton('開始測驗');
  startButton.id('start-btn');
  startButton.mousePressed(startQuiz);
  startButton.size(200, 40); // 新增固定大小

  restartButton = createButton('重新開始');
  restartButton.id('restart-btn');
  restartButton.mousePressed(restartQuiz);
  restartButton.size(200, 40); // 新增固定大小

  // 創建四個選項按鈕
  for (let i = 0; i < 4; i++) {
    let btn = createButton('');
    btn.id('option-btn-' + i);
    btn.class('option-btn');
    btn.size(400, 40);               // 固定按鈕大小，避免測量為 0
    btn.style('display', 'block');  // 確保為區塊元素
    btn.mousePressed(() => checkAnswer(btn.html().charAt(0)));
    buttons.push(btn);
  }

  // 設定 question 顯示寬度，便於定位
  questionText.style('width', '600px');

  // 初始化畫面
  showStartScreen();
}

function draw() {
  // 單色背景（已移除動態圓形）
  background(240, 245, 255);

  // 根據遊戲狀態繪製不同內容
  if (gameState === 'PLAYING') {
    fill(0);
    textSize(18);
    text(`第 ${currentQuestionIndex + 1} / ${questions.length} 題`, width / 2, 50);
    text(`分數: ${score}`, width / 2, 80);
  }
}

// 顯示開始畫面
function showStartScreen() {
  gameState = 'START';
  questionText.html('歡迎來到 p5.js 測驗！<br>準備好測試你的知識了嗎？');
  questionText.style('display', 'block');
  feedbackText.hide();
  startButton.show();
  restartButton.hide();
  buttons.forEach(btn => btn.hide());
  positionElements();
}

// 開始測驗
function startQuiz() {
  gameState = 'PLAYING';
  selectQuestions();
  currentQuestionIndex = 0;
  score = 0;
  startButton.hide();
  buttons.forEach(btn => btn.show());
  feedbackText.html('');
  feedbackText.show();
  displayQuestion();
}

// 重新開始測驗
function restartQuiz() {
  showStartScreen();
}

// 從題庫中隨機選取5題
function selectQuestions() {
  questions = [];
  let allRows = quizData.getRows();
  let shuffledRows = shuffle(allRows); // p5.js 的 shuffle 函數
  questions = shuffledRows.slice(0, 5);
}

// 新增：去除欄位前後雙引號並 trim
function stripQuotes(s) {
  if (s === null || s === undefined) return '';
  s = s.toString().trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }
  return s.replace(/\\"/g, '"').trim();
}

// 顯示當前題目和選項
function displayQuestion() {
  if (currentQuestionIndex < questions.length) {
    // 重新啟用按鈕
    buttons.forEach(b => b.removeAttribute('disabled'));

    let currentQ = questions[currentQuestionIndex];
    // 使用 stripQuotes 清理題目文字
    questionText.html(stripQuotes(currentQ.getString('question')));
    
    let options = [
      'A. ' + stripQuotes(currentQ.getString('optionA')),
      'B. ' + stripQuotes(currentQ.getString('optionB')),
      'C. ' + stripQuotes(currentQ.getString('optionC')),
      'D. ' + stripQuotes(currentQ.getString('optionD'))
    ];
    
    // 隨機排列選項（字首 A/B/C/D 與內容一併洗）
    options = shuffle(options);

    for (let i = 0; i < 4; i++) {
      buttons[i].html(options[i]);
    }
    feedbackText.html('');
    positionElements();
  } else {
    endQuiz();
  }
}

// 檢查答案
function checkAnswer(selectedOption) {
  // 確保只取首字母並大寫
  selectedOption = (selectedOption || '').toString().trim().toUpperCase().charAt(0);

  let currentQ = questions[currentQuestionIndex];
  // 讀取並清理正確答案欄位
  let correctAnswer = stripQuotes(currentQ.getString('correctAnswer')).trim().toUpperCase().charAt(0);

  // 停用所有按鈕，避免重複點選
  buttons.forEach(b => b.attribute('disabled', ''));

  if (selectedOption === correctAnswer) {
    score += 20;
    feedbackText.html('答對了！');
    feedbackText.style('color', 'green');
  } else {
    // 顯示包含文字的正確答案（也去除引號）
    const correctOptionKey = 'option' + correctAnswer;
    const correctOptionText = stripQuotes(currentQ.getString(correctOptionKey));
    feedbackText.html(`答錯了，正確答案是 ${correctAnswer}. ${correctOptionText}`);
    feedbackText.style('color', 'red');
  }

  // 短暫延遲後進入下一題
  setTimeout(() => {
    currentQuestionIndex++;
    displayQuestion();
  }, 1500);
}

// 結束測驗並顯示結果
function endQuiz() {
  gameState = 'END';
  let finalMessage = `測驗結束！<br>你的總分是: ${score} <br>`; // <- 顯示分數
  if (score === 100) {
    finalMessage += '太棒了！你是 p5.js 大師！';
  } else if (score >= 60) {
    finalMessage += '不錯喔！繼續努力！';
  } else {
    finalMessage += '再加把勁，你可以的！';
  }
  questionText.html(finalMessage);
  feedbackText.hide();
  buttons.forEach(btn => btn.hide());
  restartButton.show();
  positionElements();
}

// 調整 DOM 元素的位置
function positionElements() {
  const centerX = width / 2;
  const startY = height / 3;

  // question 寬度已固定為 600
  questionText.position(centerX - 300, startY);
  
  if (gameState === 'PLAYING') {
    // 與 setup 中 size() 相同
    const btnW = 400;
    const btnH = 40;
    let btnY = startY + 120;
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].position(centerX - btnW / 2, btnY);
      btnY += btnH + 12; // 固定間距，避免重疊
    }
    feedbackText.position(centerX - 200, btnY + 20);
  } else if (gameState === 'START') {
    startButton.position(centerX - startButton.width / 2, startY + 100);
  } else if (gameState === 'END') {
    restartButton.position(centerX - restartButton.width / 2, startY + 150);
  }
}

// 當視窗大小改變時，重新定位元素
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionElements();
}
