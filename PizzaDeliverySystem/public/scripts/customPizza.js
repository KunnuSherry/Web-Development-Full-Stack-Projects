document.addEventListener('DOMContentLoaded', (event) => {
  const calculateTotal = () => {
    let totalCost = 0;
    let baseCost = parseInt(
      document.getElementById("base").selectedOptions[0].getAttribute("data-cost")
    );
    let sauceCost = parseInt(
      document
        .getElementById("sauce")
        .selectedOptions[0].getAttribute("data-cost")
    );
    let cheeseCost = parseInt(
      document
        .getElementById("cheese")
        .selectedOptions[0].getAttribute("data-cost")
    );
    let veggiesCost = 0;
    var selectedVeggies = document.getElementById("veggies").selectedOptions;

    for (var i = 0; i < selectedVeggies.length; i++) {
      veggiesCost += parseInt(selectedVeggies[i].getAttribute("data-cost"));
    }

    totalCost += baseCost + sauceCost + cheeseCost + veggiesCost;

    let btn = document.body.querySelector("button");
    btn.innerText = `Pay ₹ ${totalCost}`;
  };

  let last = document.body.querySelector('#admin');
  last.addEventListener('click', calculateTotal);

  let element = document.createElement('div');

  element.style.height = '100px';
  element.style.padding = '5px';
  element.style.display = 'flex';
  element.style.justifyContent = 'center';
  element.style.alignItems  = 'center';
  element.style.backgroundColor = '#0e0e0e';
  element.style.borderRadius = '10px';
  element.style.boxShadow = 'rgba(255, 255, 255, 0.2) 0px 0px 11px 4px';
  element.innerHTML = `<img src="./images/checked.png" style="width: 100px; height: 100px;">
          <div class="text" style="font-size: 24px; font-family: sans-serif; font-weight: 600; color: white;">Payment Successful</div>`;

  let paybtn = document.body.querySelector('#paybtn');
  let form = document.body.querySelector('form');
  paybtn.addEventListener('click', (event) => {
    event.preventDefault();
    form.after(element);
    setTimeout(() => {
      form.submit(); 
    }, 3000); 
  });
});
