import { ErrorMessage, Field, Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader, Tooltip } from 'reactstrap';
import Image from 'next/image';

import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';

import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import { confirmAlert } from 'react-confirm-alert';

export default function Index() {
    const [createEditPage, setCreateEditPage] = useState(false)
    const [initialValues, setInitialValues] = useState({ id: null, marketPlaceKind: "", username: "", password: "", marketPlaceEndpoints: [], apiKey: "", apiSecret: "", merchantId: undefined, description: "" })

    const [stringName, setStringName] = useState("")
    const [endpoint, setEndpoint] = useState("")
    const [marketPlaceEndpointType, setMarketPlaceEndpointType] = useState("")

    const [test, setTest] = useState("")


    const [endpointDropdown, setEndpointDropdown] = useState([
        { text: "Sipariş Çekme", value: "1" },
        { text: "Ürün Oluşturma", value: "2" },
        { text: "Ürün Güncelleme", value: "3" },
        { text: "Miktar Değişikliği", value: "4" },
        { text: "Fiyat Değişikliği", value: "5" },
    ])

    const [hiddenPassordField, setHiddenPassordField] = useState(false)
    const [refreshDatatable, setRefreshDatatable] = useState(null)
    const [rpage, setrPage] = useState("")

    const [loading, setLoading] = useState(true)
    const [toggleTooltips, setToggleTooltips] = useState({ toggle: false, key: "" })
    const [categoryUpdating, setCategoryUpdating] = useState(false)
    const [selectedMerchantName, setSelectedMerchantName] = useState("")

    // Modal open state
    const [modal, setModal] = React.useState(false);

    // Toggle for Modal
    const toggleModal = () => setModal(!modal);
    useEffect(() => {

        start();
    }, [])

    const start = async () => {

        setLoading(false)
        // var roles = await GetWithToken("RoleManager/GetAllRoles").then(x => { return x.data }).catch(x => { return false })
        // var roleSelectList = []
        // setRoles(roleSelectList)
    }
    const closeModal = () => {
        setCreateEditPage(false)
    }
    const submit = async (val) => {

        setCategoryUpdating(true)
        if (val.id == undefined) {
            var data = await PostWithToken("MarketPlace/CreateMarketPlace", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }
        } else {
            var d = await PostWithToken("MarketPlace/CreateMarketPlace", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
            if (d.isError) {
                AlertFunction(d?.message)
            }
        }
        var d = await GetWithToken("CategoryManager/CreateCategories/" + val.merchantId).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setCategoryUpdating(false)

        setRefreshDatatable(new Date())
        toggleModal();


    }
    const deleteData = async (id) => {
        
        confirmAlert({
            title: "Kayıt Silinecek",
            message: "Kayıt silinecek onaylıyor musunuz",
            buttons: [
                {
                    className: "alert-danger",
                    label: "Sil",
                    onClick: async() => {

                        var d = await GetWithToken("MarketPlace/delete/" + id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
                        if (d.isError) {
                            alert(d?.message)
                        }
                        setRefreshDatatable(new Date())
                        toggleModal();
                    }
                },
                {
                    label: "Vazgeç"
                }
            ]
        })

    }


    const editData = async (data) => {


        var d = await GetWithToken("MarketPlace/GetById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setInitialValues(d.data)
        setrPage(new Date())
        toggleModal();

    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Sanal Pazar Yönetimi" map={[
                    { url: "", name: "Sanal Pazar Yönetimi" },
                    { url: "sanal-pazar-entegrasyon", name: "Sanal Pazar Entegrasyon" }]}>

                </PageHeader>


                <Modal isOpen={modal}
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>
                    <ModalBody>
                        <ModalHeader style={{ borderBottom: "1px solid #d9d9d9" }} className='mb-5'>
                            <div className='mb-2 text-center'>
                                <b>{selectedMerchantName[0]}</b> <span>adlı bayinin <b>{selectedMerchantName[1]}</b> bağlantısını tamamlamak için aşağıdaki bilgileri doldurunuz  </span>

                            </div>
                        </ModalHeader>
                        <Formik
                            initialValues={initialValues}
                            validate={values => {
                                const errors = {};

                                if (!values.marketPlaceKind || values.marketPlaceKind == "0") {
                                    errors.marketPlaceKind = 'Zorunlu Alan';
                                }
                                if (!values.merchantId) {
                                    errors.merchantId = 'Zorunlu Alan';
                                }


                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }, isValid) => {

                                values.marketPlaceKind = parseInt(values.marketPlaceKind)
                                setTimeout(async () => {

                                    submit(values)


                                    setSubmitting(false);
                                }, 400);
                            }}
                        >
                            {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values }) => (
                                <Form className='row mt-3 col-12 form-n-popup' >


                                    {/* <div className='col-6 mb-3'>
                                        <ErrorMessage name="marketPlaceKind" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Pazayeri Seçiniz</label>
                                       
                                        <select type="hidden" className="form-control" disabled id="marketPlaceKind" value={values.marketPlaceKind} onChange={(x) => { setFieldValue("marketPlaceKind", x.target.value) }} onBlur={handleBlur} name="marketPlaceKind" >
                                            <option value={null}>Seçiniz</option>
                                            <option value="1" label='Trendyol.com'></option>
                                            <option value="2" label='hepsiburada.com'></option>
                                            <option value="3" label='n11.com'></option>
                                            <option value="4" label='gittigidiyor.com'></option>
                                            <option value="5" label='ciceksepeti.com'></option>
                                            <option value="6" label='amazon.com'></option>
                                            <option value="7" label='pttavm.com'></option>

                                        </select>
                                    </div> */}



                                    {
                                        values.marketPlaceKind == 2 &&
                                        <>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="username" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Kullanıcı Adı</label>
                                                <Field type="text" id="username" className="form-control" name="username" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="password" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Şifre</label>
                                                <Field type="text" id="password" className="form-control" name="password" />
                                            </div>

                                        </>
                                    }
                                    {
                                        values.marketPlaceKind != 2 &&
                                        <>
                                            <div className='col-6 mb-3'>
                                                <label className='input-label'>Api Key</label>
                                                <ErrorMessage name="apiKey" component="div" className='text-danger danger-alert-form' />
                                                <Field type="text" id="apiKey" className="form-control" name="apiKey" />

                                            </div>
                                            <div className='col-6 mb-3'>
                                                <label className='input-label'>Api Secret Key</label>

                                                <ErrorMessage name="apiSecret" component="div" className='text-danger' />
                                                <Field type="text" id="apiSecret" className="form-control" name="apiSecret" />
                                            </div>


                                        </>
                                    }
                                    <div className='col-12 mb-3'>

                                        <label className='input-label'>Satıcı Id / Merchant Id <span style={{ color: "red" }}>*</span></label>

                                        <Field type="text" id="merchantId" className="form-control" name="merchantId" />
                                        <ErrorMessage name="merchantId" component="div" className='text-danger' />
                                    </div>
                                    {/* {categoryUpdating&&
                                    } */}
                                    {
                                        categoryUpdating &&
                                        <div className='col-12 mb-3 row'>
                                            <div>
                                                <Image width={20} height={20} src={require("../../../layout/assets/images/loading.gif")}></Image>
                                            </div>
                                            <div className='ml-1' style={{ color: "green" }}>
                                                Kategoriler yükleniyor.
                                            </div>
                                        </div>
                                    }
                                    <div className='row col-12 mt-4 justify-content-between'>
                                        <div className='col-8 row'>
                                            <div className='col-5'>
                                                <button type='submit' disabled={isSubmitting || categoryUpdating} className={"btn btn-primary btn-block loading-button" + (isSubmitting && " loading-button")}><span>Kaydet <i className="fa fa-save ml-2"></i></span></button>
                                            </div>
                                            <div className='col-5'>
                                                <button type='button' onClick={() => { toggleModal() }} className={"btn btn-warning btn-block "}><span>Kapat <i className="fas fa-undo ml-2"></i></span></button>
                                            </div>
                                        </div>

                                        <div className='col-3 '>
                                            <button type='button' onClick={() => { deleteData(values.id) }} className={"btn btn-danger btn-block "}><span>Sil <i className="fas fa-trash ml-2"></i></span></button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </ModalBody>
                </Modal>

                <div className='content pr-3 pl-3'>
                    <div className='row justify-content-center mt-3'>
                        {createEditPage &&
                            <>
                                <div className='text-center mb-2'>
                                    <h1><b>Pazar Yeri Entegrasyon</b></h1>
                                    <span style={{ fontSize: 18 }}>Entegrasyon için pazaryeri platformu tafından size verilen servis bilgilerinizi giriniz.</span>
                                </div>
                            </>
                        }
                    </div>
                    {!createEditPage &&
                        <div className='card'>
                            <DataTable Refresh={refreshDatatable} DataUrl={"AntegraMerchant/GetAllCurrentAntegraMerchant"} Headers={[
                                ["name", "Bayi Adı"],

                                {
                                    header: "Hepsiburada",
                                    dynamicButton: (d) => {

                                        var isExist = d.marketPlaces.find(x => { return x.marketPlaceKind == 2 });

                                        if (isExist) {
                                            return <button className='btn btn-sm btn-success' onClick={(x) => { setSelectedMerchantName([d.name, "hepsiburada.com"]); editData(isExist); }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={(x) => { setSelectedMerchantName([d.name, "hepsiburada.com"]); setInitialValues({ marketPlaceKind: 2, antegraMerchantId: d.id }); toggleModal() }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                {
                                    header: "Trendyol",
                                    dynamicButton: (d) => {
                                        debugger;
                                        var isExist = d.marketPlaces.find(x => { return x.marketPlaceKind == 1 });
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-success' onClick={(x) => { setSelectedMerchantName([d.name, "trendyol.com"]); editData(isExist); }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={(x) => { setSelectedMerchantName([d.name, "trendyol.com"]); setInitialValues({ marketPlaceKind: 1, antegraMerchantId: d.id }); toggleModal() }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                {
                                    header: "n11.com",
                                    dynamicButton: (d) => {
                                        var isExist = d.marketPlaces.marketPlaceKind == 3;
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                {
                                    header: "gittigidiyor.com",
                                    dynamicButton: (d) => {
                                        var isExist = d.marketPlaces.marketPlaceKind == 4;
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },

                                {
                                    header: "amazon.com",
                                    dynamicButton: (d) => {
                                        var isExist = d.marketPlaces.marketPlaceKind == 6;
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                {
                                    header: "pttacm.com",
                                    dynamicButton: (d) => {
                                        var isExist = d.marketPlaces.marketPlaceKind == 7;
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                {
                                    header: "ciceksepeti.com",
                                    dynamicButton: (d) => {
                                        var isExist = d.marketPlaces.marketPlaceKind == 5;
                                        if (isExist) {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-check-circle'></i> Uygun</button>
                                        } else {
                                            return <button className='btn btn-sm btn-warning' onClick={() => { }}><i className='fa fa-exclamation-triangle'></i> <b>Yapılandır</b></button>

                                        }

                                    }
                                },
                                // ["email", "E-posta"],
                                // ["userName", "Kullanıcı Adı"],

                            ]} Title={"Sanal Pazar (Bayi) Listesi"}
                                Description={"Entegra edilmiş sanal pazar listesi ile ürün ve plan senkronize ayarlarını güncelleyebilirsiniz"}

                                EditButton={editData}
                                DeleteButton={deleteData}
                                HideButtons
                            ></DataTable>
                        </div>
                    }
                </div>
            </Layout>
        </>
    )
}