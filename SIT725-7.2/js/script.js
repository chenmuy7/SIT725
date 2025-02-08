$(document).ready(function () {
    // ✅ Initialize Materialize components
    $('.materialboxed').materialbox();
    $('.modal').modal();

    // ✅ Load dog data from MongoDB on page load
    getAllDogs();

    // ✅ Handle form submission
    $('#formSubmit').click((event) => {
        event.preventDefault(); // ✅ Prevent default form submission
        formSubmitted();
    });

    // ✅ Initialize WebSocket only once
    if (typeof socket === 'undefined') {
        var socket = io();

        socket.on('welcome', (message) => {
            console.log("✅ Message from server:", message);
        });
    }
});

// ✅ Function to create dog cards
const addCards = (items) => {
    $('#card-section').empty(); // ✅ Clear previous cards before adding new ones
    items.forEach(item => {
        let imagePath = item.image.startsWith("/") ? item.image : `/images/${item.image}`;

        let itemToAppend = `
            <div class="col s4 center-align">
                <div class="card medium">
                    <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator" src="${imagePath}" onerror="this.src='/images/default.png';">
                    </div>
                    <div class="card-content">
                        <span class="card-title activator grey-text text-darken-4">
                            ${item.name} <i class="material-icons right">more_vert</i>
                        </span>
                        <p><a href="#">${item.info}</a></p>
                    </div>
                    <div class="card-reveal">
                        <span class="card-title grey-text text-darken-4">
                            ${item.name} <i class="material-icons right">close</i>
                        </span>
                        <p class="card-text">${item.info}</p>
                    </div>
                </div>
            </div>`;
        $("#card-section").append(itemToAppend);
    });
};

// ✅ Function to process form submission
const formSubmitted = () => {
    let formData = {
        name: $('#title').val(),
        image: $('#path').val(),
        info: $('#description').val() || "No additional info available."
    };

    console.log("Submitting form data:", formData);
    postDog(formData);
}

// ✅ Function to send data to MongoDB
function postDog(dog) {
    $.ajax({
        url: '/api/dogs',
        type: 'POST',
        data: JSON.stringify(dog),
        contentType: 'application/json',
        success: (result) => {
            if (result.statusCode === 201) {
                alert('Dog added successfully!');
                getAllDogs(); // ✅ Refresh the list
                $('#dataForm')[0].reset(); // ✅ Clear form fields
            }
        },
        error: (err) => {
            alert('Error adding dog: ' + err.responseText);
        }
    });
}

// ✅ Function to fetch all dog data from MongoDB
function getAllDogs() {
    $.get('/api/dogs', (response) => {
        if (response.statusCode === 200) {
            addCards(response.data);
        }
    }).fail((error) => {
        alert('Error loading dogs: ' + error.responseText);
    });
}
