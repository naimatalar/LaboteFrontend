import React, { useEffect, useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import Select from 'react-select'
import { GetWithToken, PostWithToken } from '../../api/crud';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import DataTable from '../../../components/datatable';
import AlertFunction from '../../../components/alertfunction';
export default function Index() {
    const [catOptions, setCatOption] = useState({})
    const [marketPlaces, setMarketPlaces] = useState([])
    const [categoryDropdownValue, setCategoryDropdownValue] = useState([])
    const [refDdl, setRefDdl] = useState(new Date())
    const [editModal, setEditModal] = useState(false)
    const [refreshDatatable, setRefreshDatatable] = React.useState();
    const [categoryName, setCategoryName] = useState("")
    const [dataTableMetaData, setDataTableMetaData] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)


    const toggleEditModal = () => { setEditModal(!editModal); }

    useEffect(() => { start() }, [])

    const createCategory = async () => {

        var marketPlaceCategory = { name: categoryName, categoryMatchModel: [] };
        var valid = true;

        marketPlaces.map((item, key) => {

            var cat = categoryDropdownValue.find(x => { return x.marketPlace == item.marketPlaceKind })
            if (cat) {
                marketPlaceCategory.categoryMatchModel.push({ marketPlaceCategoryId: cat.id, matketPlaceKind: cat.marketPlace })
            }
            else {
                valid = false
            }
        })
        if (!valid || categoryName == "") {
            AlertFunction("Kayıt Yapılamadı", "Eşleştirme için bütün sanalpazar kategorilerini seçinizi")
            return false;
        }
        var dt = await PostWithToken("CategoryManager/MatchCategory", marketPlaceCategory).then(x => { return x.data }).catch((e) => { AlertFunction("", e); return false })

        if (dt.isError) {
            AlertFunction("Kayıt Yapılamadı", dt.message)
        }
        setRefreshDatatable(new Date())
    }
    const ddlValueSet = (val) => {

        var dd = categoryDropdownValue.filter(x => { return x?.marketPlace != val.marketPlace })

        if (val?.id == undefined) {
            removeDdlValue(val)
            return false;
        }
        dd.push({ id: val.id, value: val.value, marketPlace: val.marketPlace })
        setCategoryDropdownValue(dd);
    }

    const removeDdlValue = (val) => {
        var dd = categoryDropdownValue.filter(x => { return x?.marketPlace != val.marketPlace })
        setCategoryDropdownValue(dd);
    }
    const ddlValueChange = async ({ value, marketPlace }) => {
        if (value && marketPlace) {
            var dt = await GetWithToken("CategoryManager/GetMpCategories/" + value + "/" + marketPlace).then(x => { return x.data }).catch((e) => { AlertFunction("", e); return false })
            var opt = {};
            opt = catOptions;
            opt[marketPlace] = dt.data.map((item, key) => { return { id: item.id, value: item.name, label: item.name } })
            setCatOption(opt)
            setRefDdl(new Date())

        }

    }
    const deleteFunc = async (data) => {

    }

    const editCategory = async () => {

        var dt = await PostWithToken("CategoryManager/EditMatchCategory", { id: selectedCategory.id, name: categoryName }).then(x => { return x.data }).catch((e) => { AlertFunction("", e); return false })

        if (dt.isError) {
            AlertFunction("Kayıt Yapılamadı", dt.message)
        }
        setEditModal(false)
        setRefreshDatatable(new Date())
    }
    const editFunc = async (data) => {
        setCategoryName(data.name)
        setSelectedCategory(data)
        setEditModal(true)
    }

    const start = async () => {
        var dt = await GetWithToken("MarketPlace/getCurrentUserMarketPlacesKind/").then(x => { return x.data }).catch((e) => { AlertFunction("", e); return false })
        setMarketPlaces(dt.data)
        var dtMetadata = [
            ["name", "Kategori Adı"]
        ]
        dt?.data?.map((item, key) => {
            if (item.marketPlaceKind == 1) {
                dtMetadata.push(["trendyolCategory", "Trendyol Kategori"])
            }
            if (item.marketPlaceKind == 2) {
                dtMetadata.push(["hepsiburadaCategory", "Hepsiburada Category"])
            }
        })
        setDataTableMetaData(dtMetadata)
    }
    return (

        <Layout>
            <PageHeader title="Ürün Kategori" map={[
                { url: "", name: "Ürün Yönetimi" },
                { url: "urun-listesi", name: "Ürün Listesi" }]}>
            </PageHeader>
            <div className='content'>
                <Modal size='xl' isOpen={editModal} toggle={toggleEditModal}>
                    <ModalHeader>
                        <h2>
                            Kategori Eşleştirme
                        </h2>
                        <span>Pazaryeri kategorileri eşleştime ayarları</span>

                    </ModalHeader>
                    <ModalBody>


                        <div className='row justify-content-center m-0'>
                            {
                                refDdl &&
                                marketPlaces.map((item, key) => {
                                    
                                    return <div className='col-2 p-1' key={key}>
                                        <div>
                                            <h2>{item.marketPlaceName} </h2>
                                        </div>

                                        {item.marketPlaceKind == 1 && selectedCategory != null &&
                                            <input type={"text"} disabled className='form-control' value={selectedCategory.trendyolCategory}></input>
                                        }
                                        {item.marketPlaceKind == 2 && selectedCategory != null &&
                                            <input type={"text"} disabled className='form-control' value={selectedCategory.hepsiburadaCategory}></input>
                                        }
                                        {!selectedCategory &&
                                            <Select isClearable options={catOptions?.[item.marketPlaceKind]} onInputChange={(x) => { ddlValueChange({ value: x, marketPlace: item.marketPlaceKind }); }} onChange={(x) => { ddlValueSet({ id: x?.id, value: x?.value, marketPlace: item.marketPlaceKind }) }} placeholder="Kategori" noOptionsMessage={() => { return "Kategori giriniz" }} />

                                        }
                                    </div>
                                })
                            }


                        </div>
                        <div className='row col-12 justify-content-center p-1 m-0 match-panel mt-2'>
                            <div className='col-4'  >

                                <div className='col-12 row'>

                                    <input type="text" className='form-control col-9' value={categoryName} onChange={(x) => { setCategoryName(x.target.value) }}></input>
                                    {
                                        selectedCategory == null &&
                                        <button className='btn btn-sm btn-success col-3' onClick={() => { createCategory(); setEditModal(false) }}>Eşleştir</button>
                                    }
                                    
      {
                                        selectedCategory != null &&
                                        <button className='btn btn-sm btn-success col-3' onClick={() => { editCategory(); setEditModal(false) }}>Eşleştir</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button onClick={() => setEditModal(false)} className='btn btn-danger'>Kapat</button>
                    </ModalFooter>
                </Modal>

                <DataTable Refresh={refreshDatatable} DataUrl={"CategoryManager/GetAllCategories"} Headers={dataTableMetaData} Title={"Kategori Listesi"}
                    Description={"Pazaryeri ile senkron olmak için ürün kategorileri ekleyin"}
                    HeaderButton={{ text: "Kategori Ekle", action: () => { setEditModal(true); setSelectedCategory(null) } }}
                    DeleteButton={deleteFunc}
                    EditButton={editFunc}
                ></DataTable>
            </div>
        </Layout>

    )

}