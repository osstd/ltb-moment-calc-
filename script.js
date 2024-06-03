const inputsContainer = document.getElementById("inputs-container");

function setDefault() {
  createShapeMenu(inputsContainer, beamDetails, "Dsg");

  updateBendingAxis("strong");
  createWshapeProperties(0);
  calculateOmegaTwo();
  updateOmegaTwoToUse("input");
  calculate();
  updateLu();
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
    updateLu();
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
  });

const midPointMomentInput = document
  .getElementById("mid-point-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
  });

const threeQuarterPointMomentInput = document
  .getElementById("three-quarter-point-moment")
  .addEventListener("change", () => {
    calculateOmegaTwo();
  });

const omegaInputValue = document
  .getElementById("omega-the-input")
  .addEventListener("change", () => {
    updateInputOmegaTwo();
  });

const omegaCalculatedChoice = document
  .getElementById("omega-calculated")
  .addEventListener("change", () => {
    updateOmegaTwoToUse("calc");
    calculateOmegaTwo();
  });

const omegaInputChoice = document
  .getElementById("omega-input")
  .addEventListener("change", () => {
    updateOmegaTwoToUse("input");
    updateInputOmegaTwo();
  });

let selectedBeam = beamDetails[0];
let selectedBeamIndex = 0;

function updateSelectedBeam(index) {
  selectedBeamIndex = index;
  selectedBeam = beamDetails[index];

  console.log("currentSelectedBeam:", selectedBeam, "index:", index);
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
let omegaTwoToUse = omegaTwoInput;
let omegaMode = "input";

function updateOmegaTwoInput(omega) {
  omegaTwoInput = omega;
}

function updateOmegaTwoToUse(use) {
  console.log("omegaMode:", use);
  if (use === "calc") {
    omegaTwoToUse = omegaTwo;

    omegaMode = "calc";

    console.log("currentOmegaCalculated:", omegaTwoToUse);
    updateResults("omega-in-use", `ω<sub>2</sub>: ${omegaTwoToUse}`);
  } else {
    omegaMode = "input";

    console.log("currentOmegaInput:", omegaTwoToUse);
    updateResults("omega-in-use", `ω<sub>2</sub>: ${omegaTwoToUse}`);
  }
  calculate();
}

function updateInputOmegaTwo() {
  let omegaTwoInputUse;

  omegaTwoInput = parseFloat(document.getElementById("omega-the-input").value);

  if (omegaTwoInput > 2.5) {
    omegaTwoInputUse = 2.5;
  } else {
    omegaTwoInputUse = omegaTwoInput;
  }

  if (omegaMode === "input") {
    updateResults("omega-in-use", `ω<sub>2</sub>: ${omegaTwoInputUse}`);
    omegaTwoToUse = omegaTwoInputUse;
    calculate();
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

  if (omegaMode === "calc") {
    updateResults("omega-in-use", `ω<sub>2</sub>: ${omegaTwo}`);
    omegaTwoToUse = omegaTwo;
    calculate();
  }
}

let sectionClass = "four";

function updateResults(notation, result) {
  const element = document.querySelector(`#${notation}`);
  element.innerHTML = result;
}

function calculateMrprime(Lub, omegaTwoToUse, return_index) {
  let Iy, J, Cw, Sx, Zx, FY, E, G;

  Iy = selectedBeam.Iy;
  J = selectedBeam.J;
  Cw = selectedBeam.Cw;
  Sx = selectedBeam.Sx;
  Zx = selectedBeam.Zx;

  FY = parseFloat(document.getElementById("yield-strength-input").value);

  G = 77000;
  E = 200000;

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

  if (return_index === 0) {
    return Mu;
  }
  if (sectionClass === "one" || "two") {
    Mp = parseFloat((Zx * FY) / 1000).toFixed(0);
    mpLimit = (0.67 * Mp).toFixed(0);
    if (Mu >= mpLimit) {
      return (Mrprime = (1.15 * Mp * (1 - 0.28 * (Mp / Mu))).toFixed(0));
    } else {
      return (Mrprime = Mu.toFixed(0));
    }
  } else {
    My = parseFloat((Sx * FY) / 1000).toFixed(0);
    myLimit = (0.67 * My).toFixed(0);
    if (Mu >= myLimit) {
      return (Mrprime = (1.15 * My * (1 - 0.28 * (My / Mu))).toFixed(0));
    } else {
      return (Mrprime = Mu.toFixed(0));
    }
  }
}

function calculateMr() {
  let Sx, Zx, FY;

  Sx = selectedBeam.Sx;
  Zx = selectedBeam.Zx;

  FY = parseFloat(document.getElementById("yield-strength-input").value);

  if (sectionClass === "one" || "two") {
    return (Mr = ((FY * Zx) / 1000).toFixed(0));
  } else if (sectionClass === "three") {
    return (Mr = ((FY * Sx) / 1000).toFixed(0));
  } else {
    return;
  }
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

  console.log("duringCalculateselectedBeam:", selectedBeam);

  let B,
    D,
    T,
    W,
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

  T = selectedBeam.T;
  W = selectedBeam.W;
  B = selectedBeam.B;
  Sx = selectedBeam.Sx;
  Zx = selectedBeam.Zx;

  phiFlexure = 0.9;
  N = 1.34;

  FY = parseFloat(document.getElementById("yield-strength-input").value);
  Lub = parseFloat(document.getElementById("unbraced-length-input").value);
  Mf = parseFloat(document.getElementById("max-factored-moment").value);

  utilizationRatio = 0;

  let flangeClass = "four";
  let webClass = "four";

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
    Mr = (phiFlexure * calculateMr()).toFixed(0);
  } else if (flangeClass === "two" || webClass === "two") {
    sectionClass = "two";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}</h3>`
    );
    Mr = (phiFlexure * calculateMr()).toFixed(0);
  } else {
    sectionClass = "one";
    updateResults(
      "section-class",
      `<h3>The flange is class :${flangeClass}, the web is class: ${webClass}, the overall section is class: ${sectionClass}</h3>`
    );
    Mr = (phiFlexure * calculateMr()).toFixed(0);
  }

  Mu = calculateMrprime(Lub, omegaTwoToUse, 0);

  console.log("omegaTwoToUseInCalc:", omegaTwoToUse);

  console.log(
    "Mu(1.0): ",
    (Mu / omegaTwoToUse).toFixed(0),
    "Mu(w2): ",
    Mu.toFixed(0),
    typeof Mu
  );

  if (sectionClass === "one" || sectionClass === "two") {
    Mp = parseFloat((Zx * FY) / 1000).toFixed(0);
    mpLimit = (0.67 * Mp).toFixed(0);

    if (Mu >= mpLimit) {
      Mrprime = (1.15 * phiFlexure * Mp * (1 - 0.28 * (Mp / Mu))).toFixed(0);
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
    if (Mu >= myLimit) {
      Mrprime = (1.15 * phiFlexure * My * (1 - 0.28 * (My / Mu))).toFixed(0);
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

function findDifference(Lub) {
  let Mrprime = calculateMrprime(Lub, 1.0, 1);
  return Mrprime - Mr;
}

function findLU(a, b) {
  const tolerance = 0.01;

  let iteration = 0;

  while ((b - a) / 2 > tolerance && iteration < 1000) {
    let c = (a + b) / 2;
    if (findDifference(c) === 0) return c;
    if (findDifference(c) * findDifference(a) < 0) b = c;
    else a = c;
    iteration++;
  }
  return (a + b) / 2;
}

function updateLu() {
  let Lu;
  Lu = parseFloat(findLU(0, 10000).toFixed(0));
  updateResults("Lu", `<span>L<sub>u</sub> </span> = ${Lu} mm`);
}

function managePopUp() {
  const headerLink = document.getElementById("popup");
  const popupContainer = document.getElementById("popupContainer");
  const copyBtn = document.getElementById("copyLinkBtn");

  // Function to open the popup
  headerLink.addEventListener("click", function (event) {
    event.preventDefault();
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
    const linkToCopy = "https://ltb-moment-calc.vercel.app";
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
