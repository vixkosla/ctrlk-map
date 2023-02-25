const navGroup = document.querySelector(".listing-group")





mapboxgl.accessToken = "pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw";

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/hookahlocator/cl7kyr6xl003614mdm198bykj',
    center: [43.751244, 50.618423],
    zoom: 3.7
})

//        const filterGroup = document.getElementById('filter-group');
//
//        for (let i = 0; i < 4; i++) {
//            const dataId = `инфомрация ${i}`
//
//            const input = document.createElement('input');
//            input.type = 'checkbox';
//            input.id = dataId;
//            input.checked = true;
//            filterGroup.appendChild(input);
//
//            const label = document.createElement('label');
//            label.setAttribute('for', i);
//            label.textContent = dataId;
//            filterGroup.appendChild(label);
//        }




const images = [{
        imageUrl: './icons/4A.png',
        id: '4Активная'
            },
    {
        imageUrl: './icons/0A.png',
        id: '0Активная'
            },
    {
        imageUrl: './icons/1A.png',
        id: '1Активная'
            },
    {
        imageUrl: './icons/2A.png',
        id: '2Активная'
            },
    {
        imageUrl: './icons/5A.png',
        id: '5Активная'
            },
    {
        imageUrl: './icons/4B.png',
        id: '4В Процессе'
            },
    {
        imageUrl: './icons/0B.png',
        id: "0В Процессе"
            },
    {
        imageUrl: './icons/1B.png',
        id: "1В Процессе"
            },
    {
        imageUrl: './icons/2B.png',
        id: "2В Процессе"
            },
    {
        imageUrl: './icons/5B.png',
        id: "5В Процессе"
            },
    {
        imageUrl: './icons/4C.png',
        id: '4В планах'
            },
    {
        imageUrl: './icons/0C.png',
        id: "0В планах"
            },
    {
        imageUrl: './icons/1C.png',
        id: "1В планах"
            },
    {
        imageUrl: './icons/2C.png',
        id: "2В планах"
            },
    {
        imageUrl: './icons/5C.png',
        id: "5В планах"
            },
        ]

Promise.all(
        images.map(img => new Promise((resolve, reject) => {
            map.loadImage(img.imageUrl, function (error, res) {
                map.addImage(img.id, res)
                resolve();
            })
        }))
    )
    .then(function () {

        map.on('load', () => {
            map.addSource('towers', {
                type: 'geojson',
                data: './features.geojson',
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 50,
                clusterMinPoints: 2
            })



            // draw circle for every icon 
            map.addLayer({
                id: 'unclustered-point-circle',
                type: 'circle',
                source: 'towers',
                paint: {
                    'circle-color': '#E9F1F1',
                    'circle-radius': 20
                }
            })

            //icons differeint 
            map.addLayer({
                id: 'unclustered-point',
                type: 'symbol',
                source: 'towers',
                //                    filter: ['==', 'icon', 1],
                layout: {
                    'icon-image': ['concat', ['get', 'icon'], ['get', 'status']],
                    'icon-size': 0.5,
                    'icon-allow-overlap': true,
                }
            })


            map.addLayer({
                id: 'clusters-count-bg',
                type: 'circle',
                source: 'towers',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': '#E9F1F1',
                    'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            23,
                            5,
                            27,
                            10,
                            30
                        ]
                }
            })

            map.addLayer({
                id: 'clusters',
                type: 'symbol',
                source: 'towers',
                filter: ['has', 'point_count'],
                layout: {
                    'icon-image': '5Активная',
                    'icon-allow-overlap': true,
                    'icon-size': [
                            'step',
                            ['get', 'point_count'],
                            0.7,
                            5,
                            0.85,
                            10,
                            1
                        ]
                }
            })

            map.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'towers',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': 'x{point_count_abbreviated}',
                    'text-size': 12,
                    'text-font': ['Montserrat Regular'],
                    // 'placement': "bottom-start"
                    'text-offset': [
                            'step',
                            ['get', 'point_count'],
                            ['literal', [1, 0.75]],
                            5,
                            ['literal', [1.25, 1]],
                            10,
                            ['literal', [1.5, 1.25]]
                        ],
                },
                paint: {
                    'text-color': '#2D73E8',
                }
            })

            //                map.on('click', 'unclustered-point', (e) => {
            //                    console.log('hey, красавчик')
            //                })

            const popupsName = [{
                key: 'title',
                name: ''
            }, {
                key: 'mode',
                name: 'режим'
            }, {
                key: 'adress',
                name: 'адрес'
            }, {
                key: 'range',
                name: 'диапозон'
            }, {
                key: 'frequencies',
                name: 'частоты'
            }, {
                key: 'status',
                name: 'статус'
            }]

            //            Название станции
            //            Координаты -
            //            Комплектация
            //            Режимы работы
            //            Где находится, адрес
            //            Позывной
            //            Частотный диапаз, он
            //            Частоты, МГц
            //            Статус

            map.on('click', 'clusters', (e) => {
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.getSource('towers').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;

                        map.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            });

            map.on('click', 'unclustered-point', (e) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties;
                console.log(e.features[0].properties)

                let information = Object.values(e.features[0].properties);
                //                    information.pop().pop();
                console.log(e.features[0].properties);

                let popupText = '<ul>'

                //                popupText += `<li>${coordinates}</li>`

                for (data of popupsName) {
                    popupText += `<li><span>${data['name']}</span> ${description[data['key']]}<li>`
                }

                popupText += '\<ul>'

                //                    console.log(coordinates, description);

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                //                    let 
                //                    
                //                    for (propertie of properties) {
                //                        
                //                    }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`<div>${popupText}</div>`)
                    .addTo(map);
            })


            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'towers', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'towers', () => {
                map.getCanvas().style.cursor = '';
            });


            //                fetch("./features.geojson")
            //                    .then(res => res.json())
            //                    .then(data => mata = data).then(() => console.log(mata))
            //                    .then(() => {
            //                        console.log('hello')
            //
            //
            //                        //                data[]
            //                        //                map.getSource('towers').setData()
            //
            //                    })
            //                map.setFilter(
            //                    ['unclustered-point'], ['all', ['==', 'icon', '0']]
            //                );
            //                map.setFilter(
            //                    ['unclustered-point-circle'], ['all', ['==', 'icon', '0']]
            //                );
            //                map.setFilter(
            //                    ['clusters-count-bg'], ['all', ['==', 'icon', '0']]
            //                );
            //                map.setFilter(
            //                    ['clusters'], ['all', ['==', 'icon', '0']]
            //                );
            //                map.setFilter(
            //                    ['cluster-count'], ['all', ['==', 'icon', '0']]
            // );

            // const filterIcon = 4;
            //
            // filterAllLayers();
            //
            // function filterAllLayers() {
            //
            // }

        })

    })


//const filtersTitle = document.querySelector(".listing-group-title")
//console.log(filtersTitle)

const inputsTitle = document.querySelectorAll('.listing-group-title')
const inputsFilterBoxes = document.querySelectorAll('.listing-group-filter')

const inputsFilters = document.querySelectorAll('div.listing-group-filter input')

console.log(inputsFilters)

fetch("./features.geojson")
    .then(res => res.json())
    .then(data => mata = data).then(() => console.log(mata))
    .then(() => {

        navGroup.addEventListener('change', (e) => {

            if (e.target.classList == 'title') {
                inputsFilterBoxes.forEach((el, i) => {
                    if (el.classList[1] == e.target.id) {
                        if (e.target.checked) {
                            el.style.display = 'block'
                            console.log('show')
                        } else {
                            el.style.display = 'none'
                            console.log('hide')
                        }
                    } else {
                        inputsTitle[i].firstElementChild.checked = false
                        //                console.log(inputsTitle[i].firstElementChild)
                        el.style.display = 'none'
                    }
                })
            }

            if (e.target.classList == 'filter') {

                let conditions = [];

                let filtersName = ['status', 'mode', 'type', 'frequencies']

                filtersName.forEach(filter => {

                    let inputs = document.querySelectorAll(`input[data-filterName='${filter}']`)

                    let arr = []

                    for (input of inputs) {
                        if (input.checked) {
                            arr.push(input.id)
                        }
                    }

                    conditions.push(arr)
                })

                const result = mata.features.filter((res, i) => conditions.every((condition, index) => {

                    return condition.some(c => {

                        if (filtersName[index] == 'frequencies') {
                            return condition.some(fre => res.properties['frequencies'].includes(fre))
                        } else {
                            return c == res.properties[filtersName[index]]
                        }
                    })
                }))

                console.log(result)

                map.getSource('towers').setData({
                    "type": "FeatureCollection",
                    "features": result
                })
            }
        })

    })

//function checkRepeat(el, arr) {
//    if () {
//
//        return true
//    } else {
//        return false
//    }
//}

//    console.log
//    if (e.target.classList.value === 'title') {
//        console.log('titleaasd')
//    }
//    console.log('hellotitle')
//    console.log(e.target)
//    console.log(e.target.nextElementSibling)
//    console.log(e.target.parentElement)



//    console.log(inputsTitle)
//    console.log(inputsFilter)


//    let i = 0;
//
//    for (input of inputsTitle) {
//
//        if (!input.firstChild.checked) {
//            inputsFilter[i].style.display = 'none';
////            input.firstChild.checked = true;
//            console.log('show')
//        } else if (input.firstChild.checked) {
//            inputsFilter[i].style.display = 'block';
////            input.firstChild.checked = false;
//
//            console.log('hide')
//        }
//
//        i++;
//    }


//for (filter of filtersTitle) {
//    filter.addEventListener('onclick', (e) => {
//        console.log('hi')
//    })
//}

//        filters.addEventListener('click', (e) => {
//            console.log('hi')
//        })

//filters code

//fetch("./features.geojson")
//    .then(res => res.json())
//    .then(data => mata = data).then(() => console.log(mata))
//    .then(() => {
//
//        const inputs = document.querySelectorAll('input')
//
//        navGroup.addEventListener('change', (e) => {
////            console.log('hello')
////            console.log(mata.features)
//            //                    console.log(inputGroup)
//
//            let conditions = [];
//            let maga = []
//
//            for (input of inputs) {
//                if (input.checked) {
//                    conditions.push(input.id)
//                }
//                //                        input.checked = true;
//            }
////            console.log(conditions)
//            mata.features.forEach((el) => {
//                //                        console.log(el.properties.icon)
//                for (condition of conditions) {
//                    if (condition == el.properties.icon)
//                        maga.push(el)
//                }
//                //                        conditions.includes(el.properties.icon)
//            })
////            console.log(maga)
//            map.getSource('towers').setData({
//                "type": "FeatureCollection",
//                "features": maga
//            })
//
//
//        })
//
//        //                data[]
//
//    })



//        for (input of inputGroup) {
//            input.addEventListener('change', (e) => {
//                console.log('hello');
//            })
//
//        }

//        console.log(mata)
