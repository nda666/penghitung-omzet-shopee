// ==UserScript==
// @name         Penghitung Omzet Toko Shopee 🛍️
// @namespace    http://tampermonkey.net/
// @version      v1.1
// @description  Made with ❤️ by Doran Programmer Team 👨‍💻
// @author       Doran Programmer Team 👨‍💻
// @match        *://shopee.co.id/*
// @match        *://shopee.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shopee.com
// @grant        none
// @downloadURL https://raw.githubusercontent.com/nda666/penghitung-omzet-shopee/refs/heads/main/penghitung-omzet-shopee.js
// @updateURL   https://raw.githubusercontent.com/nda666/penghitung-omzet-shopee/refs/heads/main/penghitung-omzet-shopee.js
// ==/UserScript==

(function () {
  "use strict";

  const buttonPopuler = document.createElement("button");
  buttonPopuler.innerHTML = "Hitung Omzet Populer";
  buttonPopuler.style.position = "fixed";
  buttonPopuler.style.top = "10px";
  buttonPopuler.style.right = "10px";
  buttonPopuler.style.zIndex = "9999";
  buttonPopuler.style.padding = "10px";
  buttonPopuler.style.backgroundColor = "#4CAF50";
  buttonPopuler.style.color = "#fff";
  buttonPopuler.style.border = "none";
  buttonPopuler.style.cursor = "pointer";

  const buttonTerbaru = document.createElement("button");
  buttonTerbaru.innerHTML = "Hitung Omzet Terbaru";
  buttonTerbaru.style.position = "fixed";
  buttonTerbaru.style.top = "50px";
  buttonTerbaru.style.right = "10px";
  buttonTerbaru.style.zIndex = "9999";
  buttonTerbaru.style.padding = "10px";
  buttonTerbaru.style.backgroundColor = "#4CAF50";
  buttonTerbaru.style.color = "#fff";
  buttonTerbaru.style.border = "none";
  buttonTerbaru.style.cursor = "pointer";

  const buttonTerlaris = document.createElement("button");
  buttonTerlaris.innerHTML = "Hitung Omzet Terlaris";
  buttonTerlaris.style.position = "fixed";
  buttonTerlaris.style.top = "90px";
  buttonTerlaris.style.right = "10px";
  buttonTerlaris.style.zIndex = "9999";
  buttonTerlaris.style.padding = "10px";
  buttonTerlaris.style.backgroundColor = "#4CAF50";
  buttonTerlaris.style.color = "#fff";
  buttonTerlaris.style.border = "none";
  buttonTerlaris.style.cursor = "pointer";

  // Create a fixed box to display totalRevenue
  const revenueBox = document.createElement("div");
  revenueBox.style.position = "fixed";
  revenueBox.style.top = "130px";
  revenueBox.style.right = "10px";
  revenueBox.style.zIndex = "9999";
  revenueBox.style.padding = "10px";
  revenueBox.style.backgroundColor = "#333";
  revenueBox.style.color = "#fff";
  revenueBox.style.borderRadius = "5px";
  revenueBox.style.fontSize = "14px";
  revenueBox.style.fontFamily = "Arial, sans-serif";
  revenueBox.innerHTML = "Total Omset: Rp 0";

  let totalRevenue = 0;
  let isLastPage = false; // Flag to track if we've reached the last page

  // Add event listener for the button click
  buttonPopuler.addEventListener("click", function () {
    sortBy(0);
  });

  buttonTerbaru.addEventListener("click", function () {
    sortBy(1);
  });

  buttonTerlaris.addEventListener("click", function () {
    sortBy(2);
  });

  function disableActionButtons(disabled) {
    buttonPopuler.disabled = disabled;
    buttonPopuler.style.backgroundColor = disabled ? "#B0BEC5" : "#4CAF50";

    buttonTerbaru.disabled = disabled;
    buttonTerbaru.style.backgroundColor = disabled ? "#B0BEC5" : "#4CAF50";

    buttonTerlaris.disabled = disabled;
    buttonTerlaris.style.backgroundColor = disabled ? "#B0BEC5" : "#4CAF50";
  }

  function sortBy(order) {
    resetData();
    const sortBy = document.querySelector(".sort-by-options__option-group");
    if (!sortBy) {
      alert("Hanya bisa dijalankan di halaman depan toko");
      return;
    }
    const orderButton = sortBy.querySelectorAll(".sort-by-options__option");
    disableActionButtons(true);
    orderButton[order]?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
    setTimeout(function () {
      orderButton[order].click();
    }, 3000);
    setTimeout(clickFirstPageButton(), 3000);
  }

  function resetData() {
    isLastPage = false;
    totalRevenue = 0;
    revenueBox.innerHTML = `Total Omset: Rp ${totalRevenue.toLocaleString()}<br>Sedang Memproses... 🏗️`; // Update the revenue box with formatted value
  }
  // Function to click the first page button if not already on the first page
  function clickFirstPageButton() {
    const pageController = document.querySelector(".shopee-page-controller");

    if (pageController) {
      const pageButtons = pageController.querySelectorAll(
        "button.shopee-button-no-outline"
      );
      const firstPageButton = pageButtons[0] || undefined;
      const currentPageButton = pageController.querySelector(
        "button.shopee-button-solid.shopee-button-solid--primary"
      );

      // Check if we're on the first page (the first button has the class "shopee-button-solid--primary")
      if (
        firstPageButton &&
        (!currentPageButton || currentPageButton !== firstPageButton)
      ) {
        console.log("First page clicked", firstPageButton.getHTML());
        firstPageButton.click();
        setTimeout(grabAndCalculateRevenue, 3000); // Wait for items to load (3000ms)
      } else {
        grabAndCalculateRevenue(); // Start calculation on the first page
      }
    } else {
      disableActionButtons(false);
      console.error("Page controller not found.");
    }
  }

  // Function to scroll to and click the "Next" button
  function scrollToAndClickNextButton() {
    const pageController = document.querySelector(".shopee-page-controller");
    if (pageController) {
      const currentPageButton = pageController.querySelector(
        "button.shopee-button-solid.shopee-button-solid--primary"
      );
      const nextButton = pageController.querySelector(
        "button.shopee-icon-button--right"
      );

      if (currentPageButton && nextButton) {
        const nextElement = currentPageButton.nextElementSibling;

        // Check if the next element is the "Next" button
        if (nextElement && nextElement === nextButton) {
          // If next element is "Next" button, we've reached the last page
          isLastPage = true;

          disableActionButtons(false);
          revenueBox.innerHTML = `Total Omset: Rp ${totalRevenue.toLocaleString()}<br>Selesai ✅`; // Show "Selesai" when all pages are processed
          console.log("Reached last page. Total Revenue (Rp):", totalRevenue);
        } else {
          // Scroll and click the "Next" button to go to the next page
          nextButton.scrollIntoView({ behavior: "instant", block: "center" });

          setTimeout(() => {
            nextButton.click();
            setTimeout(grabAndCalculateRevenue, 3000); // Wait for new items to load (3000ms)
          }, 500);
        }
      }
    } else {
      console.error("Page controller not found.");
    }
  }

  // Function to grab and calculate the revenue
  function grabAndCalculateRevenue() {
    revenueBox.innerHTML = "Memproses..."; // Update revenue box to "Memproses..." while processing

    const items = document.querySelectorAll(".shop-search-result-view__item");

    if (items.length === 0) {
      // If there are no items on the page, we stop the execution
      console.log("No items found on the page.");
      revenueBox.innerHTML = "Selesai"; // Change to "Selesai" when no items found
      return;
    }

    items.forEach((item) => {
      // Grab price and items sold from each item
      const priceElement = item.querySelector(
        "div.text-shopee-primary.font-medium span:nth-child(2)"
      );
      const soldElement = item.querySelector(
        ".truncate.text-shopee-black87.text-xs"
      );

      if (priceElement && soldElement) {
        const price = parseInt(priceElement.textContent.replace(/\D/g, "")); // Get price as a number
        let soldText = soldElement.textContent.match(/\d+(?:[,.]\d+)?/); // Match numbers, possibly with decimals

        if (soldText) {
          soldText = soldText[0].replace(",", "."); // Handle commas as decimal points (e.g., 1,9 -> 1.9)

          // Check if it contains "RB" indicating thousands
          if (soldText.includes("RB")) {
            soldText = soldText.replace("RB", ""); // Remove "RB"
            soldText = parseFloat(soldText) * 1000; // Multiply by 1000 for "RB"
          } else {
            soldText = parseFloat(soldText); // If no "RB", just parse it as a number
          }

          const sold = isNaN(soldText) ? 0 : soldText; // Ensure the value is a number

          // Calculate and add to total revenue
          totalRevenue += price * sold;
        }
      }
    });

    console.log("Current Total Revenue (Rp):", totalRevenue);
    revenueBox.innerHTML = `Total Omset: Rp ${totalRevenue.toLocaleString()}<br>Sedang Memproses... 🏗️`; // Update the revenue box with formatted value
    if (!isLastPage) {
      scrollToAndClickNextButton(); // Continue to the next page
    } else {
      disableActionButtons(false);
      revenueBox.innerHTML = `Total Omset: Rp ${totalRevenue.toLocaleString()}<br>Selesai ✅`; // Show "Selesai" when all pages are processed
      console.log("Pemrosesan Pendapatan Total Selesai (Rp):", totalRevenue);
    }
  }

  document.body.appendChild(buttonPopuler);
  document.body.appendChild(buttonTerbaru);
  document.body.appendChild(buttonTerlaris);
  document.body.appendChild(revenueBox);
})();
