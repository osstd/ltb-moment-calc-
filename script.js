const inputsContainer = document.getElementById("inputs-container");

function setDefault() {
  createShapeMenu(inputsContainer, beamDetails, "Dsg");

  updateBendingAxis("strong");
  createWshapeProperties(0);
  calculateOmegaTwo();
  updateOmegaTwoToUse("calc");
  calculate();
}

function createShapeMenu(container, data, key) {
  if (inputsContainer && inputsContainer.querySelector("select")) {
    // Get the select element
    const selectElement = inputsContainer.querySelector("select");

    // Remove the select element from the inputsContainer
    inputsContainer.removeChild(selectElement);
  }

  const select = document.createElement("select");

  data.forEach((item, index) => {
    const option = document.createElement("option");
    option.textContent = item[key];
    option.setAttribute("value", index);
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    const selectedIndex = parseInt(this.value);
    // might need to pass it later, keep for now
    // const selectedBeam = data[selectedIndex];
    createWshapeProperties(selectedIndex);
    calculate();
  });

  container.appendChild(select);
}

function createWshapeProperties(index) {
  updateBeamSect(index, "Dsg");
  updateBeamSect(index, "Ds_i");

  updateBeampProp(index, "Ix", "mm<sup>4</sup>");
  updateBeampProp(index, "Iy", "mm<sup>4</sup>");
  updateBeampProp(index, "J", "mm<sup>4</sup>");
  updateBeampProp(index, "Cw", "mm<sup>6</sup>");

  updateBeampProp(index, "Zx", "mm<sup>3</sup>");
  updateBeampProp(index, "Sx", "mm<sup>3</sup>");

  updateBeampProp(index, "Zy", "mm<sup>3</sup>");
  updateBeampProp(index, "Sy", "mm<sup>3</sup>");

  updateSelectedBeam(index);
}

function updateBeamSect(index, notation) {
  const element = document.querySelector(`#${notation}`);
  const elementChildToRemove = element.children[0];
  if (elementChildToRemove) {
    element.removeChild(elementChildToRemove);
  }
  const elementSpan = document.createElement("span");
  elementSpan.textContent = beamDetails[index][notation];
  element.appendChild(elementSpan);
}

function updateBeampProp(index, notation, unit) {
  const element = document.querySelector(`#${notation}`);

  let lengthChildren = element.children.length;

  let elementChildToRemove;

  if (lengthChildren > 1) {
    elementChildToRemove = element.children[1];
  }
  if (elementChildToRemove) {
    element.removeChild(elementChildToRemove);
  }
  const elementSpan = document.createElement("span");
  elementSpan.innerHTML = " " + beamDetails[index][notation] + ` ${unit}`;

  element.appendChild(elementSpan);
}

// Load type radio buttons and load and length input event listeners

const metricOption = document
  .getElementById("metric")
  .addEventListener("change", () => {
    createShapeMenu(inputsContainer, beamDetails, "Dsg");
    createWshapeProperties(0);
    calculate();
  });

const imperialOption = document
  .getElementById("imperial")
  .addEventListener("change", () => {
    createShapeMenu(inputsContainer, beamDetails, "Ds_i");
    createWshapeProperties(0);
    calculate();
  });

// Strong axis, weak axis and load event listeners

const strongAxis = document
  .getElementById("strong-bending")
  .addEventListener("change", () => {
    updateBendingAxis("strong");
    createWshapeProperties(selectedBeamIndex);

    calculate();
  });

const weakAxis = document
  .getElementById("weak-bending")
  .addEventListener("change", () => {
    updateBendingAxis("weak");
    createWshapeProperties(selectedBeamIndex);
    calculate();
  });

const momentResistance = document
  .getElementById("moment-resistance-input")
  .addEventListener("change", () => {
    calculate();
  });

const yieldStrengthInput = document
  .getElementById("yield-strength-input")
  .addEventListener("change", () => {
    calculate();
  });

const unbracedLengthInput = document
  .getElementById("unbraced-length-input")
  .addEventListener("change", () => {
    calculateOmegaTwo();
    calculate();
  });

const maxFactoredMomentInput = document
  .getElementById("max-factored-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
    calculate();
  });
const quarterPointMomentInput = document
  .getElementById("quarter-point-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
    calculate();
  });

const midPointMomentInput = document
  .getElementById("mid-point-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
    calculate();
  });
const threeQuarterPointMomentInput = document
  .getElementById("three-quarter-point-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
    calculate();
  });

const omegaCalculatedChoice = document
  .getElementById("omega-calculated")
  .addEventListener("change", () => {
    updateOmegaTwoToUse("calc");
    calculate();
  });

const omegaInputChoice = document
  .getElementById("omega-input")
  .addEventListener("change", () => {
    updateOmegaTwoToUse("input");
    calculate();
  });

let selectedBeam = beamDetails[0];
let selectedBeamIndex = 0;

function updateSelectedBeam(index) {
  selectedBeamIndex = index;
  selectedBeam = beamDetails[index];

  console.log("current selected beam:", selectedBeam, "index:", index);
}

let bendingAxis = "strong";

function updateBendingAxis(axis) {
  bendingAxis = axis;
  calculate();
}

let momentResistanceFactored = 100;
function updateMomentResistanceFactored(moment) {
  momentResistanceFactored = moment;
}

let yieldStrength = 345;
function updateYieldStrength(yield) {
  yieldStrength = yield;
}

let omegaTwo = 1.34;
let omegaTwoInput = 1;
let omegaTwoToUse = omegaTwo;

function updateOmegaTwoInput(omega) {
  omegaTwoInput = omega;
}

function updateOmegaTwoToUse(use) {
  console.log("current use:", use);
  if (use === "calc") {
    omegaTwoToUse = omegaTwo;
    console.log("current omega calculated:", omegaTwoToUse);
  } else {
    omegaTwoInput = parseFloat(
      document.getElementById("omega-the-input").value
    );
    if (omegaTwoInput > 2.5) {
      omegaTwoToUse = 2.5;
    } else {
      omegaTwoToUse = omegaTwoInput;
    }
    console.log("current omega input:", omegaTwoToUse);
  }
}

function calculateOmegaTwo() {
  let Lub, Mf, M1, M2, M3;

  Lub = parseFloat(document.getElementById("unbraced-length-input").value);
  Mf = parseFloat(document.getElementById("max-factored-moment").value);

  document.getElementById("quarter-point").innerHTML = (0.25 * Lub).toFixed(2);
  document.getElementById("mid-point").innerHTML = (0.5 * Lub).toFixed(2);
  document.getElementById("three-quarter-point").innerHTML = (
    0.75 * Lub
  ).toFixed(2);

  M1 = parseFloat(document.getElementById("quarter-point-moment").value);
  M2 = parseFloat(document.getElementById("mid-point-moment").value);
  M3 = parseFloat(document.getElementById("three-quarter-point-moment").value);

  omegaTwo = (
    (4 * Mf) /
    Math.sqrt(
      Math.pow(Mf, 2) +
        4 * Math.pow(M1, 2) +
        7 * Math.pow(M2, 2) +
        4 * Math.pow(M3, 2)
    )
  ).toFixed(2);

  if (omegaTwo > 2.5) {
    omegaTwo = 2.5;
  }
  document.getElementById(
    "omega-calculate"
  ).innerHTML = `ω<sub>2-calc</sub> = ${omegaTwo}`;
}

function updateResults(notation, result) {
  const element = document.querySelector(`#${notation}`);
  element.innerHTML = result;
}

function calculate() {
  if (bendingAxis === "weak") {
    let weakAxisResult = document.getElementById("results-bending-axis");
    weakAxisResult.style.display = "block";
    weakAxisResult.innerHTML = `<span><strong>Weak axis bending LTB does not govern design.</strong><span>`;

    document.getElementById("results-strong-axis").style.display = "none";
    return;
  }
  document.getElementById("results-bending-axis").style.display = "none";
  document.getElementById("results-strong-axis").style.display = "block";

  //   Class check

  console.log("during calculate selectedBeam:", selectedBeam);

  let B,
    D,
    T,
    W,
    Iy,
    J,
    Cw,
    E,
    G,
    Sx,
    Zx,
    phiFlexure,
    Mr,
    FY,
    Lub,
    Mf,
    Mu,
    Mp,
    Mrprime,
    Mrfinal,
    mpLimit,
    myLimit,
    utilizationRatio;

  Iy = selectedBeam.Iy;
  J = selectedBeam.J;
  Cw = selectedBeam.Cw;
  T = selectedBeam.T;
  W = selectedBeam.W;
  B = selectedBeam.B;
  Sx = selectedBeam.Sx;
  Zx = selectedBeam.Zx;
  G = 77000;
  E = 200000;

  phiFlexure = 0.9;
  N = 1.34;

  Mr = parseFloat(document.getElementById("moment-resistance-input").value);
  FY = parseFloat(document.getElementById("yield-strength-input").value);
  Lub = parseFloat(document.getElementById("unbraced-length-input").value);
  Mf = parseFloat(document.getElementById("max-factored-moment").value);

  utilizationRatio = 0;

  let flangeClass = "four";
  let webClass = "four";
  let sectionClass = "four";

  let sqrtFY = Math.sqrt(FY);

  let flangeClassThreeLimit = 200 / sqrtFY;
  let flangeClassTwoLimit = 170 / sqrtFY;
  let flangeClassOneLimit = 145 / sqrtFY;

  let webClassThreeLimit = 1900 / sqrtFY;
  let webClassTwoLimit = 1700 / sqrtFY;
  let webClassOneLimit = 1100 / sqrtFY;

  flangeBuckling = (0.5 * B) / T;
  webBuckling = (D - 2 * T) / W;

  if (flangeBuckling > flangeClassThreeLimit) {
    flangeClass = "four";
  } else if (
    flangeBuckling >= flangeClassTwoLimit &&
    flangeBuckling < flangeClassThreeLimit
  ) {
    flangeClass = "three";
  } else if (
    flangeBuckling >= flangeClassOneLimit &&
    flangeBuckling < flangeClassTwoLimit
  ) {
    flangeClass = "two";
  } else {
    flangeClass = "one";
  }

  if (webBuckling > webClassThreeLimit) {
    webClass = "four";
  } else if (
    webBuckling >= webClassTwoLimit &&
    webBuckling < webClassThreeLimit
  ) {
    webClass = "three";
  } else if (
    webBuckling >= webClassOneLimit &&
    webBuckling < webClassTwoLimit
  ) {
    webClass = "two";
  } else {
    webClass = "one";
  }

  if (flangeClass === "four" || webClass === "four") {
    sectionClass = "four";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}. Must use Seff and Feff; not the scope of this calculator</h3>`
    );
    return;
  } else if (flangeClass === "three" || webClass === "three") {
    sectionClass = "three";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}</h3>`
    );
  } else if (flangeClass === "two" || webClass === "two") {
    sectionClass = "two";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}</h3>`
    );
  } else {
    sectionClass = "one";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}</h3>`
    );
  }

  Mu = parseFloat(
    (
      (omegaTwoToUse *
        ((Math.PI / Lub) *
          Math.sqrt(
            E * Iy * Math.pow(10, 6) * G * J * Math.pow(10, 3) +
              Math.pow((Math.PI * E) / Lub, 2) *
                Iy *
                Math.pow(10, 6) *
                Cw *
                Math.pow(10, 9)
          ))) /
      1000000
    ).toFixed(0)
  );

  console.log(
    "Mu:",
    Mu / omegaTwoToUse,
    (omegaTwoToUse * Mu).toFixed(0),
    typeof Mu
  );

  if (sectionClass === "one" || sectionClass === "two") {
    Mp = parseFloat((Zx * FY) / 1000).toFixed(0);
    mpLimit = (0.67 * Mp).toFixed(0);

    console.log("Mp class 1 2", Mp);
    if (Mu >= mpLimit) {
      Mrprime = (1.15 * phiFlexure * Mp * (1 - 0.28 * (Mp / Mu))).toFixed(0);
      console.log("Mrprime class 1 2", Mrprime);
      if (Mrprime < Mr) {
        Mrfinal = Mrprime;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m >= ${mpLimit} kN.m  [0.67 * M<sub>p</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m < M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub></sup>'</sup>: ${Mrprime} kN.m`
        );
      } else {
        Mrfinal = Mr;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m >= ${mpLimit} kN.m  [0.67 * M<sub>p</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m > M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub>: ${Mr} kN.m`
        );
      }
    } else {
      Mrprime = (phiFlexure * Mu).toFixed(0);
      console.log("Mrprime", Mrprime);
      if (Mrprime < Mr) {
        Mrfinal = Mrprime;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m < ${mpLimit} kN.m  [0.67 * M<sub>p</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m < M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m`
        );
      } else {
        Mrfinal = Mr;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m < ${mpLimit} kN.m  [0.67 * M<sub>p</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m > M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub>: ${Mr} kN.m`
        );
      }
    }
  } else {
    My = parseFloat((Sx * FY) / 1000).toFixed(0);
    myLimit = (0.67 * My).toFixed(0);
    console.log("My class 3", My);
    if (Mu >= myLimit) {
      Mrprime = (1.15 * phiFlexure * My * (1 - 0.28 * (My / Mu))).toFixed(0);
      console.log("Mrprime class 3", Mrprime);
      if (Mrprime < Mr) {
        Mrfinal = Mrprime;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m >= ${myLimit} kN.m  [0.67 * M<sub>y</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m < M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m`
        );
      } else {
        Mrfinal = Mr;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m >= ${myLimit} kN.m  [0.67 * M<sub>y</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m > M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub>: ${Mr} kN.m`
        );
      }
    } else {
      Mrprime = phiFlexure * Mu;
      console.log("Mrprime", Mrprime);
      if (Mrprime < Mr) {
        Mrfinal = Mrprime;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m < ${myLimit} kN.m  [0.67 * M<sub>y</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m < M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m`
        );
      } else {
        Mrfinal = Mr;
        updateResults(
          "results",
          `M<sub>u</sub>: ${Mu} kN.m < ${myLimit} kN.m  [0.67 * M<sub>y</sub>] <br>M<sub>r</sub><sup>'</sup>: ${Mrprime} kN.m > M<sub>r</sub>: ${Mr} kN.m <br>M<sub>r</sub>: ${Mr} kN.m`
        );
      }
    }
  }

  utilizationRatio = (Mf / Mrfinal).toFixed(2);

  if (utilizationRatio > 1) {
    updateResults(
      "utilization",
      `<strong>M<sub>f</sub>/M<sub>r</sub> = ${utilizationRatio} > 1 - Section Fail</strong>`
    );
  } else {
    updateResults(
      "utilization",
      `<strong>M<sub>f</sub>/M<sub>r</sub> = ${utilizationRatio} < 1 - OK</strong>`
    );
  }
}

function managePopUp() {
  const headerLink = document.getElementById("popup");
  const popupContainer = document.getElementById("popupContainer");
  const copyBtn = document.getElementById("copyLinkBtn");

  // Function to open the popup
  headerLink.addEventListener("click", function (event) {
    event.preventDefault();
    console.log("clicked");
    setTimeout(() => {
      popupContainer.style.display = "block";
    }, 150);
  });

  // Function to close the popup
  function closePopup() {
    popupContainer.style.display = "none";
  }

  // Close the popup when clicking outside or pressing Esc
  document.addEventListener("click", function (event) {
    if (!popupContainer.contains(event.target)) {
      closePopup();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePopup();
    }
  });

  copyBtn.addEventListener("click", function () {
    const linkToCopy = "https://www.oshemy.info";
    navigator.clipboard
      .writeText(linkToCopy)
      .then(function () {
        alert("Link copied to clipboard: " + linkToCopy);
      })
      .catch(function (error) {
        console.error("Unable to copy link: ", error);
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setDefault();
  managePopUp();
});
