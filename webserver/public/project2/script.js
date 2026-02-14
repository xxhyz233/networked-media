// Lookup table for clock
let lookup_60_list = [
  "$\\ln(1)$", // 0
  "$\\sin^2(\\theta) + \\cos^2(\\theta)$", // 1
  "$\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x \\approx e$", // 2
  "$\\sum_{n=0}^{\\infty} \\frac{1}{2^n} + 1$", // 3
  "$\\frac{d}{dx}(x^4) \\big|_{x=1}$", // 4
  "$\\sqrt{3^2 + 4^2}$", // 5
  "$3!$", // 6
  "$\\lfloor \\frac{22}{7} \\rfloor + 4$", // 7
  "$\\log_2(256)$", // 8
  "$\\int_{0}^{3} 2x \\, dx$", // 9
  "$\\binom{5}{2}$", // 10
  "$\\sqrt{121}$", // 11
  "$\\int_{0}^{2} 3x^2 \\, dx + 4$", // 12
  "$\\sqrt{169}$", // 13
  "$\\sum_{n=0}^{3} n^2$", // 14
  "$\\binom{6}{2}$", // 15
  "$2^4$", // 16
  "$\\lfloor \\sqrt{300} \\rfloor$", // 17
  "$\\int_{0}^{3} (2x + 3) \\, dx$", // 18
  "$\\sqrt{361}$", // 19
  "$\\binom{6}{3}$", // 20
  "$\\sum_{i=1}^{6} i$", // 21
  "$\\lceil 7\\pi \\rceil$", // 22
  "$\\sqrt{529}$", // 23
  "$4!$", // 24
  "$5^2$", // 25
  "$3^3 - 1$", // 26
  "$3^3$", // 27
  "$\\sum_{i=1}^{7} i$", // 28
  "$\\sqrt{841}$", // 29
  "$\\sum_{k=1}^{4} k^2$", // 30
  "$\\lfloor e^{\\pi} \\rfloor + 8$", // 31
  "$2^5$", // 32
  "$\\sum_{i=1}^{3} i^3 - 3$", // 33
  "$F_{9}$", // 34
  "$\\binom{7}{3}$", // 35
  "$6^2$", // 36
  "$\\lfloor 10\\pi + 5.5 \\rfloor$", // 37
  "$2 \\times 19$", // 38
  "$\\int_{0}^{3} (3x^2 + 4) \\, dx$", // 39
  "$\\frac{5!}{3}$", // 40
  "$\\sqrt{1681}$", // 41
  "$\\lfloor 100 \\times \\ln(1.522) \\rfloor$", // 42
  "$44 - \\cos(0)$", // 43
  "$\\sum_{i=0}^{4} 2^i + 13$", // 44
  "$\\sum_{i=1}^{9} i$", // 45
  "$\\lceil e^{3.8} \\rceil + 1$", // 46
  "$7^2 - 2$", // 47
  "$4! \\times 2$", // 48
  "$7^2$", // 49
  "$\\frac{10^2}{2}$", // 50
  "$17 \\times 3$", // 51
  "$52*1$", // 52
  "$106 \\div 2$", // 53
  "$\\int_{0}^{3} 6x^2 \\, dx$", // 54
  "$\\sum_{i=1}^{10} i$", // 55
  "$\\binom{8}{3}$", // 56
  "$19 \\times 3$", // 57
  "$\\lfloor \\sqrt{3400} \\rfloor$", // 58
  "$60 - \\frac{d}{dx}(x) \\big|_{x=5}$", // 59
  "$5 \\times 4 \\times 3$", // 60
];

let emptySlots_2025 = new Array(2025).fill("");

let formulas_2026 = [emptySlots_2025,
  "$\\sum_{i=1}^{63} i + 10$", // 2026
  "$\\binom{24}{3} + 22$", // 2027
  "$\\int_{0}^{6} (x^3 + 1) \\, dx + 722$", // 2028
  "$45^2 + 4$", // 2029
  "$\\lfloor 646.17 \\pi \\rfloor$", // 2030
  "$\\sum_{k=0}^{10} (k^2 + 1) + 1635$", // 2031
  "$2^{11} - 16$", // 2032
  "$\\frac{d}{dx}(\\frac{x^{2034}}{2034}) \\big|_{x=1} + 2032$", // 2033
  "$\\sqrt{4137156}$", // 2034
  "$\\binom{22}{3} + 495$", // 2035
  "$6^4 + 740$", // 2036
  "$\\sum_{n=1}^{63} n + 21$", // 2037
  "$\\int_{0}^{2} (x^7 + 3x^2) \\, dx + 2000$", // 2038
  "$\\lfloor e^{7.62} \\rfloor$", // 2039
  "$\\frac{5! \\times 17}{1}$", // 2040
  "$\\sqrt{4165681}$", // 2041
  "$3 \\times 680 + 2$", // 2042
  "$\\binom{20}{3} + 903$", // 2043
  "$\\sum_{i=1}^{63} i + 28$", // 2044
  "$45^2 + 19$", // 2045
  "$\\lceil 651.26 \\pi \\rceil$", // 2046
  "$\\int_{0}^{10} (6x^2 + 4.7) \\, dx$", // 2047
  "$2^{11}$", // 2048
  "$7^4 - 352$", // 2049
  "$\\int_{0}^{10} (6x^2 + 5) \\, dx$", // 2050
  "$\\binom{22}{3} + 511$", // 2051
  "$\\sum_{k=1}^{63} k + 36$", // 2052
  "$\\sqrt{4214809}$", // 2053
  "$\\int_{0}^{4} (3x^2 + 500) \\, dx + 12$", // 2054
  "$\\lfloor 654.12 \\pi \\rfloor$", // 2055
  "$\\frac{10310}{5}$", // 2056
  "$\\sum_{i=0}^{10} 2^i + 1033$", // 2057
  "$\\binom{23}{3} + 287$", // 2058
  "$45^2 + 34$", // 2059
  "$\\int_{0}^{10} (6x^2 + 6) \\, dx$", // 2060
  "$3 \\times 687$", // 2061
  "$\\lceil e^{7.631} \\rceil$", // 2062
  "$\\frac{d}{dx}(x^2 + 2062x) \\big|_{x=0.5}$", // 2063
  "$2^{11} + 16$", // 2064
  "$\\sum_{n=1}^{64} n - 15$", // 2065
  "$\\binom{25}{3} + 234 - 268$", // 2066
  "$\\sqrt{4272489}$", // 2067
  "$\\int_{0}^{2} (x^9) \\, dx + 2067.89 \\dots$", // 2068 
  "$\\lfloor 2068 + \\cos^2(\\theta) + \\sin^2(\\theta) \\rfloor$", // 2069
  "$\\int_{0}^{10} (6x^2 + 7) \\, dx$", // 2070
  "$\\sum_{k=1}^{64} k - 9$", // 2071
  "$\\frac{6216}{3}$", // 2072
  "$\\binom{21}{3} + 743$", // 2073
  "$45^2 + 49$", // 2074
  "$\\lfloor 660.49 \\pi \\rfloor$", // 2075
  "$2^{11} + 28$", // 2076
  "$\\sqrt{4313929}$", // 2077
  "$\\sum_{i=1}^{12} i^2 + 1428$", // 2078
  "$3 \\times 693$", // 2079
  "$\\int_{0}^{10} (6x^2 + 8) \\, dx$", // 2080
  "$\\sum_{n=1}^{64} n + 1$", // 2081
  "$\\binom{26}{3} + 482 - 1000$", // 2082 
  "$\\lceil e^{7.641} \\rceil + 1$", // 2083
  "$\\sqrt{4343056}$", // 2084
  "$5 \\times 417$", // 2085
  "$\\sum_{k=1}^{20} k \\times 10 - 14$", // 2086
  "$\\frac{d}{dx}(1043.5x^2) \\big|_{x=1}$", // 2087
  "$2^{11} + 40$", // 2088
  "$\\int_{0}^{3} (x^4 + 100) \\, dx + 1741.4$", // 2089 
  "$\\binom{10}{3} \\times 17 + 50$", // 2090
  "$17 \\times 123$", // 2091
  "$\\lfloor 665.91 \\pi \\rfloor$", // 2092
  "$\\sqrt{4380649}$", // 2093
  "$46^2 - 22$", // 2094
  "$\\sum_{i=1}^{64} i + 15$", // 2095
  "$\\binom{22}{4} + 1365 - 1984$", // 2096 
  "$\\int_{0}^{10} (6x^2 + 9.7) \\, dx$", // 2097
  "$2^{11} + 50$", // 2098
  "$\\lceil e^{7.649} \\rceil + 2$", // 2099
  "$\\int_{0}^{10} (6x^2 + 10) \\, dx$", // 2100
];

let lookup_2026_list = [...emptySlots_2025, ...formulas_2026];

window.MathJax = {
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
  },
};

// Clock visual setup
window.onload = () => {
  let second = document.getElementsByClassName("clock-second");
  let minute = document.getElementsByClassName("clock-minute");
  let hour = document.getElementsByClassName("clock-hour");

  let day = document.getElementsByClassName("clock-day");
  let month = document.getElementsByClassName("clock-month");
  let year = document.getElementsByClassName("clock-year");

  // Change time every sec
  // Using military time hh:mm:ss, as I'm not an American.
  setInterval(() => {
    let date = new Date();
    second[0].innerHTML = lookup_60_list[date.getSeconds()];
    minute[0].innerHTML =
      lookup_60_list[date.getMinutes()];
    hour[0].innerHTML =
      lookup_60_list[date.getHours()];

    day[0].innerHTML =
      lookup_60_list[date.getDay()+8];
    month[0].innerHTML =
      lookup_60_list[date.getMonth()+1]
    year[0].innerHTML =
      lookup_2026_list[2026]

    console.log(
      "Day: " +
        date.getDay() +
        " Month: " +
        date.getMonth() +
        " Year: " +
        date.getFullYear(),
    );
    // Loads and renders LaTeX every 1 sec
    MathJax.typeset();
  }, 1000);
};
