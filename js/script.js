
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    // Set the current year in the footer
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // Bootstrap mobile navbar: close after selecting a section
    const navbarMenu = document.getElementById("navbarMenu");
    const navLinks = document.querySelectorAll("#navbarMenu .nav-link");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            if (
                navbarMenu &&
                navbarMenu.classList.contains("show") &&
                window.bootstrap
            ) {
                const collapse = bootstrap.Collapse.getOrCreateInstance(navbarMenu);
                collapse.hide();
            }
        });
    });

    // Order form elements
    const orderForm = document.getElementById("orderForm");
    const foodItem = document.getElementById("foodItem");
    const quantity = document.getElementById("quantity");
    const orderType = document.getElementById("orderType");
    const customerAddress = document.getElementById("customerAddress");
    const orderTotal = document.getElementById("orderTotal");
    const orderMessage = document.getElementById("orderMessage");

    // Return the price associated with the selected menu item
    function getSelectedPrice() {
        if (!foodItem || foodItem.selectedIndex < 0) {
            return 0;
        }

        const selectedOption = foodItem.options[foodItem.selectedIndex];

        return Number(selectedOption.dataset.price) || 0;
    }

    // Calculate the estimated total
    function updateOrderTotal() {
        if (!foodItem || !quantity || !orderTotal) {
            return;
        }

        const price = getSelectedPrice();
        const count = Number(quantity.value);

        const safeQuantity =
            Number.isInteger(count) && count >= 1 && count <= 20
                ? count
                : 0;

        const total = price * safeQuantity;

        orderTotal.textContent = total.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        });
    }

    if (foodItem) {
        foodItem.addEventListener("change", updateOrderTotal);
    }

    if (quantity) {
        quantity.addEventListener("input", updateOrderTotal);
    }

    // Require an address only when delivery is selected
    function updateAddressRequirement() {
        if (!orderType || !customerAddress) {
            return;
        }

        const deliverySelected = orderType.value === "Delivery";

        customerAddress.required = deliverySelected;

        if (!deliverySelected) {
            customerAddress.setCustomValidity("");
            customerAddress.classList.remove("is-invalid");
        }
    }

    if (orderType) {
        orderType.addEventListener("change", updateAddressRequirement);
    }

    // Menu card buttons preselect the relevant item in the order form
    const menuOrderButtons = document.querySelectorAll(".order-item");

    menuOrderButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const selectedItem = button.dataset.item;

            if (!foodItem || !selectedItem) {
                return;
            }

            foodItem.value = selectedItem;
            updateOrderTotal();

            foodItem.dispatchEvent(new Event("change", { bubbles: true }));

            const orderSection = document.getElementById("order");

            if (orderSection) {
                orderSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

            foodItem.focus({ preventScroll: true });
        });
    });

    // Display an accessible form message
    function showMessage(element, message, type) {
        if (!element) {
            return;
        }

        element.textContent = message;
        element.className = "alert alert-" + type;
        element.setAttribute("role", type === "success" ? "status" : "alert");
    }

    function hideMessage(element) {
        if (!element) {
            return;
        }

        element.textContent = "";
        element.className = "alert d-none";
    }

    // Clear stale feedback when the user edits the form
    if (orderForm) {
        orderForm.addEventListener("input", function () {
            hideMessage(orderMessage);
        });

        orderForm.addEventListener("change", function () {
            hideMessage(orderMessage);
        });

        // Order form validation and demo submission
        orderForm.addEventListener("submit", function (event) {
            event.preventDefault();

            updateAddressRequirement();

            // Browser validation checks required fields, input types,
            // min/max values, and the specified patterns.
            if (!orderForm.checkValidity()) {
                orderForm.classList.add("was-validated");

                const firstInvalid = orderForm.querySelector(":invalid");

                if (firstInvalid) {
                    firstInvalid.focus();
                }

                showMessage(
                    orderMessage,
                    "Please correct the highlighted fields before submitting.",
                    "danger"
                );

                return;
            }

            const selectedFood = foodItem.value;
            const selectedQuantity = Number(quantity.value);
            const selectedPrice = getSelectedPrice();
            const total = selectedPrice * selectedQuantity;

            if (
                !selectedFood ||
                !Number.isInteger(selectedQuantity) ||
                selectedQuantity < 1 ||
                selectedQuantity > 20 ||
                selectedPrice <= 0
            ) {
                showMessage(
                    orderMessage,
                    "Please choose a valid food item and quantity.",
                    "danger"
                );

                return;
            }

            const deliveryAddress = customerAddress.value.trim();

            if (orderType.value === "Delivery" && !deliveryAddress) {
                customerAddress.setCustomValidity(
                    "Please enter a delivery address."
                );

                orderForm.classList.add("was-validated");
                customerAddress.classList.add("is-invalid");
                customerAddress.focus();

                showMessage(
                    orderMessage,
                    "Please enter your delivery address.",
                    "danger"
                );

                return;
            }

            // Frontend demo only: no payment or actual order is processed.
            showMessage(
                orderMessage,
                "Demo request validated! Your selection: " +
                selectedFood +
                " × " +
                selectedQuantity +
                ". Estimated total: " +
                total.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                }) +
                ". No actual order has been placed.",
                "success"
            );

            orderForm.reset();
            orderForm.classList.remove("was-validated");

            if (customerAddress) {
                customerAddress.setCustomValidity("");
                customerAddress.classList.remove("is-invalid");
            }

            updateAddressRequirement();
            updateOrderTotal();
        });
    }

    // Contact form validation
    const contactForm = document.getElementById("contactForm");
    const contactMessage = document.getElementById("contactMessage");

    if (contactForm) {
        contactForm.addEventListener("input", function () {
            hideMessage(contactMessage);
        });

        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add("was-validated");

                const firstInvalid = contactForm.querySelector(":invalid");

                if (firstInvalid) {
                    firstInvalid.focus();
                }

                showMessage(
                    contactMessage,
                    "Please complete all required fields correctly.",
                    "danger"
                );

                return;
            }

            // Frontend demo only: connect a backend to deliver messages.
            showMessage(
                contactMessage,
                "Your contact form passed validation. This demo does not send messages to a server.",
                "success"
            );

            contactForm.reset();
            contactForm.classList.remove("was-validated");
        });
    }

    // Initial calculations and validation setup
    updateAddressRequirement();
    updateOrderTotal();
});
