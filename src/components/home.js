import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card, Title } from "react-native-paper";
import axios from 'axios'
import Colors from "../constant/color";
import { ProgressDialog } from 'react-native-simple-dialogs';


function Item({ id, data, onSelect }) {
    return (
        <TouchableOpacity
            onPress={() => onSelect(id)}
        >
            <Card style={styles.container}>
                <View style={styles.headerOne}>
                    <Text style={styles.titleOne}>{data.name}</Text>
                    <Text style={styles.liteText}>{data.created === undefined ? " NA" : data.created.slice(0, 10)}</Text>
                </View>

                <View style={styles.headerOne}>
                    <Text style={styles.liteText}>
                        <MaterialCommunityIcons name="eye" size={18} color={Colors.accent} />
                        {`  ${data.eye_color}`}
                    </Text>
                    <Text style={styles.liteText}>
                        Gender
            {data.gender === 'male' ?
                            <MaterialCommunityIcons name="gender-male" size={18} color={Colors.accent} /> :
                            data.gender === 'n/a' ? "NA" : <MaterialCommunityIcons name="gender-female" size={18} color={Colors.accent} />}
                    </Text>
                </View>


                <View style={styles.headerOne}>

                    <Text style={styles.liteText}>
                        <FontAwesome name="birthday-cake" size={18} color={Colors.accent} />
                        {`  ${data.birth_year}`}
                    </Text>
                </View>
            </Card>

        </TouchableOpacity>
    );
}
function Home() {
    const [data, setData] = useState([]);
    const [modal, setModal] = useState(false);//MODAL ON/OFF
    const [personData, setPersonData] = useState({})//USER SPECIFIC DATA
    const [selected, setSelected] = useState(new Map());
    const [page, setPage] = useState(1)//PAGE COUNT
    const [dataFetched, setDataFetched] = useState(true)//PROGRESS DIALOG 
    const [dataFetchedDetail, setDataFetchedDetail] = useState(false)//PROGRESS DIALOG 
    //const [pageCount, setPageCount] = useState(1)

    useEffect(() => {
        //GET DATA
        console.log("run")
        axios.get(`https://swapi.co/api/people/?page=${page}`)
            .then(function (response) {
                     setData(data.concat(response.data.results))
                    setDataFetched(false)
               
            })
            .catch(function (error) {
                console.log("axios", error);
                setPage(1)
            });
    },[page]);

    const onSelect =
        async (data) => {
            setDataFetchedDetail(true)//PROGRESS DIALOG ON
            function afterDataFetched() {
                setPersonData(data)//SET DATA
                setDataFetched(false)//PROGRESS DIALOG OFF
                setModal(true)//MODAL VISIBAL
            }
            //FETCH NESSESARY DATA TO SHOW CHARACTORS INFO
            await axios.get(`${data.homeworld}`)
                .then(function (response) {
                    data.homeworld = response.data.name
                    afterDataFetched()
                })
                .catch(function (error) {
                    console.log(error);
                });
            await data.films.map(async (films, item) => {
                await axios.get(`${films}`)
                    .then(function (response) {
                        data.films[item] = response.data.title
                        afterDataFetched()
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            })

            await axios.get(`${data.species}`)
                .then(function (response) {
                    data.species = response.data.name
                    afterDataFetched()
                })
                .catch(function (error) {
                    console.log(error);
                });
            await data.vehicles.map(async (vehicles, item) => {
                await axios.get(vehicles)
                    .then(function (response) {
                        data.vehicles[item] = response.data.name
                        afterDataFetched()
                    }).catch(function (error) {
                        console.log(error);
                    });
            })
            await data.starships.map((starships, item) => {
                axios.get(starships)
                    .then(function (response) {
                        data.starships[item] = response.data.name
                        afterDataFetched()

                    })
                    .catch(function (error) {
                        afterDataFetched()
                        console.log(error);
                    });
            })


            //}

        }


    const handleLoadMore = () => {
        //NEXT PAGE
        setPage(page + 1)
    }
    const onCloseIcon = () => {
        setModal(false)//CLOSE MODAL
        setDataFetchedDetail(false)//REMOVE PROGRESSDIALOG
    }



    return (

        <View style={{ backgroundColor: "gainsboro", paddingBottom: 50 }}>
            <ProgressDialog
                visible={dataFetched}
                title="Progress Dialog"
                message="Please, wait... Star-War is Loading...."
                activityIndicatorColor='#0074C8'
                activityIndicatorSize='large'
            />
            <ProgressDialog
                visible={dataFetchedDetail}
                title="Progress Dialog"
                message="Please, wait... Star-War      Character is Loading...."
                activityIndicatorColor='#0074C8'
                activityIndicatorSize='large'
            />
            <View style={styles.header}>
                <Title style={styles.title}>Star-War Characters {data.count === null ? 2 : data.count}</Title>
            </View>
            <FlatList

                data={data}
                renderItem={({ item }) => (
                    <Item
                        id={item}
                        title={item.title}
                        data={item}
                        selected={!!selected.get(item.id)}
                        onSelect={onSelect}
                    />
                )}
                keyExtractor={item => item.name + Math.random()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.01}
            // onScrollBeginDrag={console.log("scroll to")}
            // onMomentumScrollBegin
            />

            <Modal animationType={"fade"} onRequestClose={() => { setModal(false) }}
                visible={modal}
                transparent={true}
            >
                <Card style={styles.containerModal}>
                    <View style={{ marginBottom: -25 }}>
                        <MaterialCommunityIcons onPress={onCloseIcon} name="close-circle-outline" size={25} color={Colors.accent} />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.title}>{personData.name}</Text>
                        <Text style={styles.liteText}>{personData.created === undefined ? " NA" : personData.created.slice(0, 10)}</Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            <MaterialCommunityIcons name="eye" size={18} color={Colors.accent} />
                            {`  ${personData.eye_color}`}
                        </Text>
                        <Text style={styles.liteText}>
                            Gender
                                {personData.gender === 'male' ?
                                <MaterialCommunityIcons name="gender-male" size={18} color={Colors.accent} /> :
                                personData.gender === 'n/a' ? " NA" : <MaterialCommunityIcons name="gender-female" size={18} color={Colors.accent} />}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            <FontAwesome name="birthday-cake" size={18} color={Colors.accent} />
                            {`  ${personData.birth_year}`}
                        </Text>
                        <Text style={styles.liteText}>
                            <MaterialCommunityIcons name="home" size={18} color={Colors.accent} />
                            {`  ${personData.homeworld}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            height:  {`  ${personData.height}`}
                        </Text><Text style={styles.liteText}>
                            skin_color:  {`  ${personData.skin_color}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            hair_color:  {`  ${personData.hair_color}`}
                        </Text>
                        <Text style={styles.liteText}>
                            mass:  {`  ${personData.mass}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            species:  {`  ${personData.species}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            <MaterialCommunityIcons name="car" size={18} color={Colors.accent} />
                            {`  ${personData.vehicles === undefined || personData.vehicles.length === 0 ? " NA" : personData.vehicles}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            <MaterialCommunityIcons name="ship-wheel" size={18} color={Colors.accent} />
                            {`  ${personData.starships === undefined || personData.starships.length === 0 ? " NA" : personData.starships}`}
                        </Text>
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.liteText}>
                            <MaterialCommunityIcons name="filmstrip" size={18} color={Colors.accent} />
                            {`  ${personData.films === undefined || personData.films.length === 0 ? " NA" : personData.films}`}
                        </Text>
                    </View>
                </Card>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 30,
        paddingHorizontal: 15
    },
    title: {
        fontSize: 30,
        color: "#6F00F8",
        // color:'royalblue',
        //marginTop: -13
    },
    container: {
        padding: 15,
        margin: 20,
    },
    containerModal: {
        padding: 15,
        margin: 20,
        // marginLeft: 25,
        //marginTop: 30,
        height: 650,
        width: 355,
        backgroundColor: "white"
    },
    headerOne: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6
    },
    titleOne: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.primary
    },
    liteText: {
        color: Colors.liteGrey
    }
});
export default Home