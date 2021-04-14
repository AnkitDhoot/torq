let quizNo = 0;
let subjectNo = "";
let quesNo = 0;
let subject = "";
let temp = localStorage.getItem("score");
let score = temp ? JSON.parse(temp) : {};

let totals = {};
let totalofAllSubjects = 0;

const calculateTotal = () => {
  let allScores = localStorage.getItem("score") || null;
  if (allScores === null) {
    return;
  }
  allScores = JSON.parse(allScores);
  totalofAllSubjects = 0;
  for (let sub in allScores) {
    totals[sub] = 0;
    for (let qNo in allScores[sub]) {
      totals[sub] += allScores[sub][qNo];
      totalofAllSubjects = totalofAllSubjects + parseInt(allScores[sub][qNo]);
    }
  }
};

document.getElementById("reset").addEventListener("click", function () {
  window.localStorage.removeItem("score");
  document.location.reload();
});
// ======================================================data-fetching==========================================================================================================

(async function getData() {
  try {
    calculateTotal();
    document.getElementById("mainScore").innerHTML =
      totalofAllSubjects + "/220";

    // console.log(score);
    let cardData = await fetch("./json/card.json");
    let card = await cardData.json();

    let questionData = [];
    let quizQuestion = await fetch("./json/question.json");
    questionData = await quizQuestion.json();
    // console.log(questionData);

    let subjectData = document.getElementById("main");

    // ========================================================================card-creation===============================================================================================================================================================================================================================================================================================================================================================

    let mainSubject =
      '<section class="mt-5" id="%sId%"><section id="%subjectName%"><h4>%Name%</h4><div class="row">%allcards%</div></section></section>';
    let htmlCard =
      '<div class="col-lg-3 col-md-6 col-sm-12 mt-3 d-flex justify-content-center"><div id="%cardId%" data-quizNo = "%quizNo%" class="card"> <div class="card-body"><h5 class="card-title" id="qNo">Quiz-%no%</h5><h3 class="card-title text-capitalize">%cardName%</h3><p class="card-text">10 Questions</p> <p class="card-text"><b>Score:<span id="%marksOfThisQuiz%"> %thismarks%</span>/10</b></p> <button type="button" data-quiz="%quizid%" class="btn btn-primary card-button" data-toggle="modal" data-target="#exampleModal"> Start </button>   </div></div></div> ';

    for (const n in card) {
      let newmainSubject = mainSubject.replace("%sId%", n);
      newmainSubject = newmainSubject
        .replace("%subjectName%", card[n].quizName)
        .replace("%Name%", card[n].quizName);

      let allcards = "";
      for (let i = 0; i < card[n].quizCards.length; i++) {
        let newHtmlCard = htmlCard.replace(
          "%cardId%",
          card[n].quizCards[i].cardNo
        );
        newHtmlCard = newHtmlCard.replace(
          "%cardName%",
          card[n].quizCards[i].cardTopic
        );
        newHtmlCard = newHtmlCard.replace(
          "%quizid%",
          card[n].quizCards[i].cardNo
        );
        newHtmlCard = newHtmlCard.replace(
          "%marksOfThisQuiz%",
          `marks-${card[n].quizCards[i].cardNo}`
        );

        const subjectNameAndNumber = card[n].quizCards[i].cardNo.split("-");
        newHtmlCard = newHtmlCard.replace(
          "%thismarks%",
          score[subjectNameAndNumber[0]]
            ? score[subjectNameAndNumber[0]][subjectNameAndNumber[1]] || 0
            : 0
        );
        newHtmlCard = newHtmlCard.replace("%quizNo%", i + 1);
        newHtmlCard = newHtmlCard.replace("%no%", i + 1);
        allcards += newHtmlCard;
      }
      newmainSubject = newmainSubject.replace("%allcards%", allcards);
      subjectData.insertAdjacentHTML("beforeend", newmainSubject);
    }

    // =====================================================================modal-question==============================================================================================

    document.querySelectorAll(".card-button").forEach((element) => {
      element.addEventListener("click", () => {
        quizNo = element.getAttribute("data-quiz");
        // console.log(quizNo)
        let [name, no] = quizNo.split("-");
        // console.log(name)
        // console.log(parseInt(no))
        document.getElementById("exampleModalLabel").innerHTML =
          "Quiz-" + parseInt(no);
        quesNo = 0;
        subjectNo = no;
        subject = name;
        // console.log(score.subject);
        // console.log(subjectNo);
        score[subject] = score[subject] || {};
        score[subject][subjectNo] = 0;
        document.getElementById("pts").innerHTML = score[subject][subjectNo];
        newScore = JSON.stringify(score);
        localStorage.setItem("score", newScore);
        calculateTotal();
        document.getElementById("mainScore").innerHTML =
          totalofAllSubjects + "/220";

        document.getElementById(`marks-${subject}-${subjectNo}`).innerHTML =
          score[subject][subjectNo];

        showQuestion(questionData, no, name);
      });
    });
    const showQuestion = (questionData, no, name) => {
      let ques = document.getElementById("question");
      let op1 = document.getElementById("opt1");
      let op2 = document.getElementById("opt2");
      let op3 = document.getElementById("opt3");
      let op4 = document.getElementById("opt4");
      ques.innerHTML = `Q. ${quesNo + 1} ${
        questionData[name][parseInt(no) - 1][quesNo].question
      }`;

      op1.innerHTML =
        "1." + questionData[name][parseInt(no) - 1][quesNo].options[0];
      op2.innerHTML =
        "2." + questionData[name][parseInt(no) - 1][quesNo].options[1];
      op3.innerHTML =
        "3." + questionData[name][parseInt(no) - 1][quesNo].options[2];
      op4.innerHTML =
        "4." + questionData[name][parseInt(no) - 1][quesNo].options[3];
      // console.log(questionData[name][parseInt(no)-1][quesNo].correctAnswer)

      for (k = 1; k < 5; k++) {
        eval(`op${k}`).setAttribute("data-correctans", "");
      }
      eval(
        `op${questionData[name][parseInt(no) - 1][quesNo].correctAnswer}`
      ).setAttribute("data-correctans", true);
    };

    // ===============================================================Question-change====================================================================================
    document.querySelectorAll(".options").forEach((element) => {
      element.addEventListener("click", (event) => {
        // console.log(event.toElement.id);
        let clicked = event.srcElement.id;
        // console.log(clicked);
        if (element.getAttribute("data-correctans") === "true") {
          // console.log("right");
          // ================================================================Option-color-change=====================================================================================
          $(".options").removeClass("right-wrong");
          document.getElementById(clicked).style.backgroundColor = "green";
          document.getElementById(clicked).style.fontWeight = "bold";
          score[subject][subjectNo]++;
          document.getElementById("pts").innerHTML = score[subject][subjectNo];
          let newScore = JSON.stringify(score);
          localStorage.setItem("score", newScore);
          calculateTotal();
          document.getElementById("mainScore").innerHTML =
            totalofAllSubjects + "/220";

          document.getElementById(`marks-${subject}-${subjectNo}`).innerHTML =
            score[subject][subjectNo];
        } else {
          // console.log("wrong");
          $(".options").removeClass("right-wrong");
          document.getElementById(clicked).style.backgroundColor = "red";
          document.getElementById(clicked).style.fontWeight = "bold";
        }
        setTimeout(() => {
          $(".options").addClass("right-wrong");
          document.getElementById(clicked).style.backgroundColor = "#555555";
          document.getElementById(clicked).style.fontWeight = "normal";
          quesNo++;
          if (questionData[subject][parseInt(subjectNo) - 1].length > quesNo) {
            showQuestion(questionData, subjectNo, subject);
          } else {
            $("#exampleModal").modal("hide");
            $(".modal-backdrop").remove();
          }
        }, 700);
      });
    });
  } catch (error) {
    console.log("error in fetching data", error);
  }
})();
