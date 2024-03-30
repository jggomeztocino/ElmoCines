// Se activa una vez el DOM está completamente cargado.
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene el parámetro 'movie' de la URL.
    const urlParams = new URLSearchParams(window.location.search);
    const movie = urlParams.get('movie'); // Obtiene el parámetro 'movie' de la URL

    if (movie) {
        // Si hay un parámetro 'movie', carga la información y las fechas de sesión de la película.
        loadMovieInfo(movie);
        loadSessionDates(movie).then(() => console.log('Sesiones cargadas'));
        // Añade un event listener al botón de entradas para redirigir al usuario a la pre-reserva con el parámetro de la película.
        document.getElementById('btnEntradas').addEventListener('click', function() {
            window.location.href = "pre-booking.html?movie=" + movie;
        });
    } else {
        mensajeError('Error de parametrización. \nNo introduzca la URL manualmente >:(');
    }
});

// Función para cargar la información de la película seleccionada
function loadMovieInfo(movie) {
    fetch('/billboard/' + movie)
        .then(response => response.json())
        .then(data => {
            // Rellena el contenido de la página con la información de la película
            document.querySelector('.caratula img').src = data.cover_url;
            document.querySelector('.info h3').textContent = data.movie;
            document.querySelector('.info h5').nextElementSibling.textContent = data.directors;
            document.querySelector('.info h5:nth-of-type(2)').nextElementSibling.textContent = data.actors.join(', ');
            document.querySelector('.info h5:nth-of-type(3)').nextElementSibling.textContent = `${data.duration} min`;
            document.querySelector('.info h5:nth-of-type(4)').nextElementSibling.textContent = data.synopsis;
            document.querySelector('.reproductor iframe').src = data.trailer;
        })
        .catch(error => {
            mensajeError('Error al cargar la información de la película', error);
        });
}

// Función para cargar y mostrar las fechas de sesión disponibles para la película seleccionada
async function loadSessionDates(movieId) {
    try {
        const response = await fetch(`/sessions/${movieId}`);
        const sesiones = await response.json();

        const fechas = sesiones.map(sesion => sesion.fecha);
        // How to Use the Spread Operator in JavaScript (https://www.freecodecamp.org/news/three-dots-operator-in-javascript/
        // In JavaScript, you use the spread operator to expand an iterable inside a specified receiver, as its name suggests.
        const fechasUnicas = [...new Set(fechas)];
        const diasDisponibles = fechasUnicas.filter(fecha => {
            return sesiones.some(sesion => sesion.fecha === fecha && sesion.butacas_libres > 0);
        });

        if(document.getElementById("noticket")) {
            document.getElementById("noticket").remove();
        }

        if (diasDisponibles.length === 0) {
            document.getElementById('labelFechas').style.display = 'none';
            document.getElementById('selectorFecha').style.display = 'none';
            document.getElementById('bloqueEntradas').style.display = 'none';

            const mensajeNoDisponible = document.createElement('div');
            mensajeNoDisponible.innerHTML = "<h2 id='noticket' style='margin-top: 30px'>No quedan entradas para esta película... :(</h2>";
            mensajeNoDisponible.className = "text-center";
            document.getElementById('sesiones').appendChild(mensajeNoDisponible);
            return;
        }

        const hoy = new Date().toISOString().split('T')[0];
        const defaultDate = diasDisponibles.find(fecha => fecha >= hoy) || hoy;

        flatpickr("#selectorFecha", {
            dateFormat: "Y-m-d",
            minDate: hoy,
            maxDate: fechasUnicas[fechasUnicas.length - 1],
            defaultDate: defaultDate,
            enable: diasDisponibles,
            disable: fechasUnicas.filter(fecha => !diasDisponibles.includes(fecha)),
            altInput: true,
            altFormat: "J \\de F \\de Y", // Cambiado para mostrar "1 de Abril de 2024"
            locale: {
                firstDayOfWeek: 1,
                weekdays: {
                    shorthand: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                    longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
                },
                months: {
                    shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                    longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                },
                ordinal: () => {
                    return ""; // Sufijo para el día del mes
                }
            },
        });

        document.getElementById('selectorFecha').addEventListener('change', function() {
            const fechaSeleccionada = this.value;
            mostrarSesionesPorFecha(sesiones.filter(sesion => sesion.fecha === fechaSeleccionada));
        });

        mostrarSesionesPorFecha(sesiones.filter(sesion => sesion.fecha === defaultDate));
    } catch (error) {
        mensajeError('Error al cargar las sesiones', error);
    }
}

// Función para mostrar las sesiones disponibles de la película para una fecha seleccionada
function mostrarSesionesPorFecha(sesionesFiltradas) {
    const contenedorSesiones = document.getElementById('sesionesPelicula');
    contenedorSesiones.innerHTML = '';

    if (sesionesFiltradas.length > 0) {
        sesionesFiltradas.forEach(({ hora, sala, butacas_libres }) => {
            if (butacas_libres === 0) return;
            const div = document.createElement('div');
            div.style.backgroundColor = 'var(--color-principal)';
            div.style.marginRight = '20px';
            div.style.marginTop = '20px';
            div.style.padding = '15px';
            div.style.borderRadius = '5px';
            div.style.width = '190px'; // Establece un ancho fijo para todos los bloques
            div.classList.add('sesionIndividual');
            div.innerHTML = `
                <p><strong>Hora:</strong> ${hora}</p>
                <p><strong>Sala:</strong> ${sala}</p>
                <p><strong>Butacas restantes:</strong> ${butacas_libres}</p>
            `;
            contenedorSesiones.appendChild(div);
        });
    } else {
        contenedorSesiones.innerHTML = '<p>No hay sesiones disponibles para esta fecha.</p>';
    }
}

// Función para mostrar mensaje de error en consola y en el DOM
function mensajeError(msj, error){
    console.error(error);

    const container = document.querySelector('.containerbody');
    container.innerHTML = '';
    container.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'h-100');

    const row = document.createElement('div');
    row.classList.add('row');
    row.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'h-100', 'text-center');
    container.appendChild(row);

    let mensajes = msj.split('\n');
    mensajes.forEach(mensaje => {
        const h = document.createElement('h1');
        h.textContent = mensaje;
        row.appendChild(h);
    });
}



