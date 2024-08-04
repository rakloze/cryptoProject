$(document).ready(function() {
    // Initialize cache
    const cache = {};

    // Track selected coins for reports
    let selectedCoins = [];

    // Load the initial content
    loadHome();

    // Event listeners for navigation
    $('#home').click(function() {
        loadHome();
    });

    $('#about').click(function() {
        loadAbout();
    });

    $('#reports').click(function() {
        loadReports();
    });

    $('#search-button').click(function(e) {
        e.preventDefault();
        searchCoins();
    });

    // Function to load home page
    function loadHome() {
        loadCoins();
    }

    // Function to load coins
    function loadCoins() {
        $.ajax({
            url: 'https://api.coingecko.com/api/v3/coins/list',
            method: 'GET',
            success: function(data) {
                displayCoins(data.slice(0, 100)); // Display only the first 100 coins
            },
            error: function(error) {
                console.log('Error fetching coins:', error);
            }
        });
    }

    // Function to display coins
    function displayCoins(coins) {
        let content = `
            <div class="home-page">
                <h2 class="text-center">Cryptocurrency List</h2>
                <div class="row">
        `;
        coins.forEach(function(coin) {
            content += `
                <div class="col-md-2" style="width: 30%;">
                    <div class="card" style="width:100%">
                        <div class="card-body">
                            <div class="content">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h4 class="card-title">${coin.symbol.toUpperCase()}</h4>
                                    <label class="switch">
                                        <input type="checkbox" class="coin-switch" data-coin="${coin.symbol}">
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                                <p class="card-text">${coin.name}</p>
                                <button class="btn btn-info more-info" data-coin-id="${coin.id}">More Info</button>
                                <div class="collapse mt-2" id="collapse-${coin.id}">
                                    <div class="card card-body" id="info-${coin.id}">
                                        <!-- Additional info will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        content += '</div></div>';
        $('#main-content').html(content);

        // Add event listeners to the switches and More Info buttons
        $('.coin-switch').change(function() {
            handleSwitchChange();
        });

        $('.more-info').click(function() {
            const coinId = $(this).data('coin-id');
            handleMoreInfo(coinId);
        });
    }

    // Function to handle switch change
    function handleSwitchChange() {
        const checkedSwitches = $('.coin-switch:checked');
        if (checkedSwitches.length > 5) {
            // Uncheck the last checked switch
            checkedSwitches.last().prop('checked', false);
            alert('You can select up to 5 coins only.');
        } else {
            // Update selected coins list
            selectedCoins = [];
            checkedSwitches.each(function() {
                selectedCoins.push($(this).data('coin'));
            });
        }
    }

    // Function to handle More Info button click
    function handleMoreInfo(coinId) {
        const collapseId = `#collapse-${coinId}`;
        const infoId = `#info-${coinId}`;

        if (cache[coinId] && (new Date() - cache[coinId].timestamp < 2 * 60 * 1000)) {
            // Use cached data if it's not older than 2 minutes
            $(infoId).html(renderCoinInfo(cache[coinId].data));
        } else {
            // Fetch new data
            $(infoId).html('<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div></div>');
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/${coinId}`,
                method: 'GET',
                success: function(data) {
                    cache[coinId] = {
                        data: data,
                        timestamp: new Date()
                    };
                    $(infoId).html(renderCoinInfo(data));
                },
                error: function(error) {
                    console.log('Error fetching coin info:', error);
                }
            });
        }
        $(collapseId).collapse('toggle');
    }

    // Function to render coin info
    function renderCoinInfo(data) {
        const usdPrice = data.market_data.current_price.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const eurPrice = data.market_data.current_price.eur.toLocaleString('en-EU', { style: 'currency', currency: 'EUR' });
        const ilsPrice = data.market_data.current_price.ils.toLocaleString('he-IL', { style: 'currency', currency: 'ILS' });

        return `
            <img src="${data.image.small}" class="coinLogo" alt="${data.name}">
            <p>USD: ${usdPrice}</p>
            <p>EUR: ${eurPrice}</p>
            <p>ILS: ${ilsPrice}</p>
        `;
    }

    // Function to load About section
    function loadAbout() {
        const aboutContent = `
            <div class="about-page">
                <h2>About Cryptonite</h2>
                <p>Cryptonite is your go-to application for cryptocurrency information. Our platform provides real-time data on various cryptocurrencies, including their prices, history, and more. Whether you're a seasoned trader or just getting started, Cryptonite offers the tools you need to make informed decisions in the world of virtual trading.</p>
                <p>Our mission is to make cryptocurrency trading accessible and understandable for everyone. We believe in the power of blockchain technology and are committed to providing accurate and up-to-date information to our users.</p>
            </div>
        `;
        $('#main-content').html(aboutContent);
    }

    // Function to load Reports section
    function loadReports() {
        $('#main-content').html('<h2>Real-Time Reports</h2><p>This is the real-time reports section.</p>');
    }

    // Function to search coins
    function searchCoins() {
        const query = $('#search-input').val().toLowerCase();
        $.ajax({
            url: 'https://api.coingecko.com/api/v3/coins/list',
            method: 'GET',
            success: function(data) {
                const filteredCoins = data.filter(coin => coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query));
                displayCoins(filteredCoins);
            },
            error: function(error) {
                console.log('Error fetching coins:', error);
            }
        });
    }
});
