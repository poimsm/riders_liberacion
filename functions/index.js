const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// let test = () => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve('chau');
//         }, 700);
//     })
// }

let distanceMatrix = [];
let ids = [];

let ordenarRiders = (riders, lat, lng) => {
    distanceMatrix = [];

    riders.forEach(rider => {
        const distance = Math.sqrt((rider.lat - lat) * (rider.lat - lat) + (rider.lng - lng) * (rider.lng - lng));
        distanceMatrix.push({
            distance,
            id: rider.rider
        });
    });

    const ridersOrdenados = [];
    let matrix_temp = [];
    matrix_temp = JSON.parse(JSON.stringify(distanceMatrix));

    riders.forEach(rider => {

        const data = iterar(matrix_temp);

        const id = data.id;

        ridersOrdenados.push(id);

        matrix_temp = JSON.parse(JSON.stringify(data.matrix));

    });

    return ridersOrdenados;
}

let iterar = (riders) => {

    if (riders.length != 0) {
        let a = 0;
        let b = riders[0].distance;
        let id = riders[0].id;

        if (riders.length != 1) {
            riders.forEach(data => {
                a = data.distance;
                if (a < b) {
                    b = a;
                    id = data.id;
                }
            });

            ids.push(id);

            let riders_restantes = [];

            distanceMatrix.forEach(item => {
                ids.forEach(id => {
                    if (id != item.id) {
                        riders_restantes.push(item);
                    }
                });
            });

            return { id, matrix: riders_restantes };

        } else {

            return { id: riders[0].id, matrix: [] };
        }

    }
}


exports.rider = functions.https.onRequest(async (request, response) => {

    response.set('Access-Control-Allow-Origin', "*");
    response.set('Access-Control-Allow-Methods', 'GET, POST');

    const db = admin.firestore();
    const checkouts = request.body;
    const tipo = request.query.tipo;

    if (tipo == 'riders') {
        let promesas = [];

        checkouts.forEach(checkout => {

            promesas.push(
                db.doc('riders/' + checkout.rider).update({
                    aceptadoId: '',
                    cliente_activo: '',
                    pagoPendiente: false,
                })
            );
        });

        return Promise.all(promesas).then(() => {
            response.json({ ok: true });
        }).catch(() => response.json({ ok: false }));
    }

    if (tipo == 'coors') {
        let promesas = [];

        checkouts.forEach(checkout => {

            promesas.push(
                db.doc('riders_coors/' + checkout.rider).update({
                    pagoPendiente: false,
                })
            );
        });

        return Promise.all(promesas).then(() => {
            response.json({ ok: true });
        }).catch(() => response.json({ ok: false }));
    }


    response.json({ ok: false });

    // if (tipo == 'buscar_riders') {

    //     const vehiculo = request.body.vehiculo;
    //     const lat = request.body.lat;
    //     const lng = request.body.lng;

    //     const ref = db.collection('riders_coors');

    //     ref.where('actividad', '==', 'disponible')
    //         .where('isOnline', '==', true)
    //         .where('isActive', '==', true)
    //         .where('pagoPendiente', '==', false)
    //         .where('vehiculo', '==', vehiculo)
    //         .get().then(querySnapshot => {
    //             const riders = [];
    //             querySnapshot.forEach(doc => {
    //                 riders.push(doc.data())
    //             });

    //             if (riders.length == 0) {
    //                 return response.json({ ok: false });
    //             };

    //             const ridersOrdenados = ordenarRiders(riders, lat, lng);

    //             if (ridersOrdenados.length > 3) {
    //                 return response.json({ ok: true, riders: [ridersOrdenados[0], ridersOrdenados[1], ridersOrdenados[2]] });
    //             }

    //             response.json({ ok: true, riders: ridersOrdenados });
    //         });
    // };


    // if (tipo == 'solicitar_rider') {
    //     const pedido = request.body.pedido;
    //     const cliente = request.body.cliente;
    //     const rider = request.body.rider;

    //     const data_fireRider = {
    //         nuevaSolicitud: true,
    //         pagoPendiente: true,
    //         created: new Date().getTime(),
    //         fase: 'esperando_confirmacion',
    //         dataPedido: {
    //             cliente: {
    //                 _id: cliente._id,
    //                 nombre: cliente.nombre,
    //                 img: cliente.img.url,
    //                 role: cliente.role
    //             },
    //             pedido: {
    //                 distancia: pedido.distancia,
    //                 origen: pedido.origen.direccion,
    //                 destino: pedido.destino.direccion,
    //                 costo: pedido.costo
    //             }
    //         }
    //     };

    //     const data_fireCoors = {
    //         pagoPendiente: true
    //     };

    //     await db.doc('riders_coors/' + rider._id).update(data_fireCoors);
    //     await db.doc('riders/' + rider._id).update(data_fireRider);

    //     response.json({ ok: true });
    // };







});