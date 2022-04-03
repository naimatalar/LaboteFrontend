import { ErrorMessage, Field, Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader, Tooltip } from 'reactstrap';
import Image from 'next/image';

import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import { PriceSplitter } from '../../../components/pricesptitter';

import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import SetREsultValueOnLanoratory from '../../../components/setUserOnLanoratory';
import SetDeviceOnLanoratory from '../../../components/setDeviceOnLaboratory';
import CurrencyInput from 'react-currency-input-field';
import SetOrRemoveExaminationResultValueType from '../../../components/setOrRemoveExaminationResultValueType';
const isBrowser = typeof window === 'undefined'
export default function Index() {
    const [createEditPage, setCreateEditPage] = useState(false)
    const [initialValues, setInitialValues] = useState({ id: null, name: "", description: "", code: "" })
    const [refreshDatatable, setRefreshDatatable] = useState(new Date())
    const [selectedLaboratory, setSelectedLaboratory] = useState();
    const [loading, setLoading] = useState(true)
    const [pageRefresh, setPageRefresh] = useState(new Date())
    const [priceValue, setPriceValue] = useState(0)
    const [selectedExamination, setSelectedExamination] = useState({})

    // Modal open state
   
    const [devices, setDevices] = React.useState([]);
    const [selectAll, setSelectAll] = React.useState(false);
    const [currency, setCurrency] = React.useState();
    const [modelCurrencies, setModelCurrencies] = React.useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
 
    const [modal, setModal] = React.useState(false);
    const toggleModal = () => {setModal(!modal);if (!modal) { setSelectAll(false) } }

    const [modalSetREsultValue, setModalSetREsultValue] = React.useState(false);
    const toggleSetREsultValueModal = () => setModalSetREsultValue(!modalSetREsultValue);
    useEffect(() => {

        start();

    }, [])

    const start = async () => {

        setLoading(false)
        var laborat = await GetWithToken("Device/GetAllDevicesByTopic").then(x => { return x.data }).catch(x => { return false })

        setDevices(laborat.data)
        // var roleSelectList = []
        // setRoles(roleSelectList)
    }

    const submit = async (val) => {


        if (val.id == undefined) {
            var data = await PostWithToken("sampleExamination/CreateSampleExamination", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }
            setRefreshDatatable(new Date())

        } else {
            var d = await PostWithToken("sampleExamination/CreateSampleExamination", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
            if (d.isError) {
                AlertFunction("İşlem Yapılamadı", d?.message)
            }
        }

        setRefreshDatatable(new Date())
        toggleModal();


    }
    const deleteData = async (data) => {
        var d = await GetWithToken("Laboratory/delete/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            AlertFunction("İşlem Yapılamadı", d?.message)
        }
        setRefreshDatatable(new Date())
    }


    const editData = async (data) => {

        var d = await GetWithToken("sampleExamination/GetSampleExaminationById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        // setModaDevice(d.data.sampleExaminationDevices.map((item,key)=>{return item.id}))
        var ccrnc=[]
        for (const item of d.data?.sampleExaminationPriceCurrencies) {
            ccrnc.push({currencyType:item.currencyType,price:item.price})
        }
        setModelCurrencies(ccrnc)

        setInitialValues(d.data)
        toggleModal(true);
    }

    const setOrRemoveCurrency = async (action) => {
        var crr = modelCurrencies;
        if (action) {
            var acc = crr.filter(x => { return x != action })
            setModelCurrencies(acc)
        } else {
            crr.push({ currencyType: currency, price: priceValue })
        }
        setPageRefresh(new Date())
    }

    const selectAllControl = async (x) => {


        if (x.target.checked) {
            setSelectAll(true)
            setSelectedDevices(devices.map((item, key) => { return item.id }))
        } else {
            setSelectAll(false)
            setSelectedDevices([])

        }
        setPageRefresh(new Date())
    }


    return (
        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Sistem & Tanımlama" map={[
                    { url: "", name: "Sistem & Tanımlama" },
                    { url: "Analiz-tanimlari", name: "Analiz Tanimlari" }]}>

                </PageHeader>


                <Modal isOpen={modal}
                    size="lg"
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>
                    <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center mb-2">
                        </div>
                        <div className="d-flex ">
                            <p>Analiz <b>Tanımlama</b> Formu</p>
                        </div>
                        <button onClick={toggleModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                    </ModalHeader>  <ModalBody>

                        <Formik
                            initialValues={initialValues}
                            validate={values => {
                                const errors = {};


                                if (!values.name) {
                                    errors.name = 'Bu alan zorunludur';
                                }
                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {
                                values.code = ""
                                values.sampleExaminationDevices = selectedDevices
                                values.sampleExaminationPriceCurrencies = modelCurrencies
                                console.log(values)
                                setTimeout(async () => {
                                   await submit(values)
                                    setSubmitting(false);
                                }, 400);
                            }}
                        >
                            {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values }) => (
                                <Form className='row mt-3 col-12 form-n-popup' >
                                    {initialValues && <>
                                        <ErrorMessage name="id" component="div" className='text-danger' />
                                        <Field type="hidden" name="id" />
                                        <div className='col-6  mb-3'>
                                            <ErrorMessage name="name" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Analiz Adı</label>
                                            <Field type="text" id="name" className="form-control" name="name" />
                                        </div>
                                        <div className='col-6 mb-3'>
                                            <ErrorMessage name="sampleMethod" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Metod</label>
                                            <Field type="text" id="sampleMethod" className="form-control" name="sampleMethod" />
                                        </div>


                                        <div className='col-12 mb-3'>
                                            <ErrorMessage name="description" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Analiz Açıklama</label>
                                            <Field as="textarea" name="description" className="form-control">
                                            </Field>
                                            {/* <textarea type="text" id="description" className="form-control" onChange={handleChange} onBlur={handleBlur} ></textarea> */}
                                        </div>

                                        <div className='col-6 mb-4 row'>
                                            <div className='col-12 p-0 mb-1'>
                                                <b className='mt-2'>Analiz Sırasında Olası Kullanılacak Cihazlar</b>
                                                <div className='mt-2 select-all-label'>
                                                    {
                                                        selectAll && <label>  <input checked={true} type={"checkbox"} onBlur={selectAllControl} onChange={selectAllControl} ></input> Tümünü Seç</label>
                                                    }
                                                    {
                                                        !selectAll && <label>  <input type={"checkbox"} onChange={selectAllControl} onBlur={selectAllControl}   ></input> Tümünü Seç</label>
                                                    }
                                                </div>
                                            </div>
                                            {
                                                pageRefresh &&
                                                devices.map((item, key) => {



                                                    var select = values?.sampleExaminationDevices?.filter(x => { ; return x == item.id }).length > 0
                                                    if (selectAll) {
                                                        return <div key={key} className={"col-5"}> <label> <input id={item.id} checked value={item.id} type="checkbox" onChange={(x) => { setSelectAll(false); handleChange(x); setSelectedDevices(values.sampleExaminationDevices); setPageRefresh(new Date()) }} onBlur={(x) => { handleBlur(x); setSelectedDevices(values.sampleExaminationDevices); setPageRefresh(new Date()) }} name='sampleExaminationDevices'></input> {item.name + " " + item.brand}</label>  </div>
                                                    } else {
                                                        return <div key={key} className="col-5"> <label> <input id={item.id} checked={select} value={item.id} type="checkbox" onChange={(x) => { setSelectAll(false); setSelectedDevices(values.sampleExaminationDevices); setPageRefresh(new Date()); handleChange(x); }} onBlur={(x) => { handleBlur(x); setSelectedDevices(values.sampleExaminationDevices); setPageRefresh(new Date()) }} name='sampleExaminationDevices'></input> {item.name + " " + item.brand} </label>  </div>

                                                    }

                                                })
                                            }
                                        </div>

                                        <div className='col-6 mb-3'>
                                            <div className='row col-12 mb-4'>
                                                <b>Fiyatlandırma Seçeneği Ekleme</b>
                                            </div>
                                            <div className='row justif-content-center'>
                                                <div className='col-5'>
                                                    <label className='input-label'>Tutar</label>
                                                    <CurrencyInput
                                                        decimalsLimit={2}
                                                        onValueChange={(value, name) => { setPriceValue(value) }}

                                                        value={priceValue}
                                                        className="form-control"
                                                        suffix="₺"
                                                    />
                                                </div>

                                                <div className='col-4'>
                                                    <label className='input-label' >Kur</label>
                                                    <select onChange={(x) => { setCurrency(x.target.value) }} className='form-control'>
                                                        <option>Seç</option>
                                                        <option value={1}>TRY ₺</option>
                                                        <option value={2}>USD $</option>
                                                        <option value={3}>EURO €</option>
                                                        <option value={4}>GBP £</option>

                                                    </select>
                                                </div>

                                                <div className='col-3'>
                                                    <button className='btn btn-success'  type='button'  onClick={() => { setOrRemoveCurrency()}}><i className='fas fa-plus-circle'></i> Ekle</button>
                                                </div>
                                                <div className='col-12 mt-2'>
                                                    <table style={{ width: "100%" }} className="table table-bordered">
                                                        <tr style={{ background: "#eeeeee" }}>
                                                            <td><b>Tutar</b></td>
                                                            <td><b>Kur</b></td>
                                                            <td><b>#</b></td>
                                                        </tr>
                                                        {modelCurrencies.length == 0 &&
                                                            <tr>
                                                                <td colSpan={3} style={{ textAlign: "center", color: "red" }}>
                                                                    Kayıtlı Fiyatlandırma Bulunmuyor

                                                                </td>
                                                            </tr >
                                                        }
                                                        {

                                                            modelCurrencies.map((item, key) => {
                                                                var crrnc = ""
                                                                debugger;
                                                                if (item.currencyType == 1) {
                                                                    crrnc = "TRY (Türk Lirası)"
                                                                } else if (item.currencyType == 2) {
                                                                    crrnc = "USD (Amerikan Doları)"
                                                                } else if (item.currencyType == 3) {
                                                                    crrnc = "EURO"
                                                                } else if (item.currencyType == 4) {
                                                                    crrnc = "GBP (İngiliz Sterlini)"
                                                                }


                                                                return <tr key={key}>
                                                                    <td>{PriceSplitter(item.price)}</td>
                                                                    <td>{crrnc}</td>
                                                                    <td><button type='button' onClick={() => { setOrRemoveCurrency(item) }} className="btn btn-sm btn-danger"><i className='fa fa-trash'></i> Sil</button></td>

                                                                </tr>
                                                            })
                                                        }
                                                    </table>

                                                </div>
                                            </div>
                                        </div>

                                        <div className='row col-12 mt-4'>
                                            <div className='col-3'>
                                                <button type='submit' disabled={isSubmitting} className={"btn btn-primary btn-block loading-button" + (isSubmitting && " loading-button")}><span>Kaydet <i className="icon-circle-right2 ml-2"></i></span></button>
                                            </div>
                                            <div className='col-3'>
                                                <button type='button' onClick={() => { toggleModal() }} className={"btn btn-warning btn-block "}><span>Kapat <i className="fas fa-undo ml-2"></i></span></button>
                                            </div>
                                        </div>
                                    </>}
                                </Form>
                            )}
                        </Formik>

                    </ModalBody>
                </Modal>

                <Modal isOpen={modalSetREsultValue}
                    toggle={toggleSetREsultValueModal}
                    size='lg'
                    modalTransition={{ timeout: 100 }}>
                  <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <div className="d-flex justify-content-center mb-2">
                            </div>
                            <div className="d-flex ">
                                <p>Analiz Sonuç Değerleri Tanımlama  </p>
                            </div>
                            <button onClick={toggleSetREsultValueModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                        </ModalHeader>  
                          <ModalBody>
                      

                        <div className='row col-12'>
                            <SetOrRemoveExaminationResultValueType Examination={selectedExamination}></SetOrRemoveExaminationResultValueType>
                        </div>
                    </ModalBody>
                </Modal>


                <div className='content pr-3 pl-3'>
                    <div className='row justify-content-center mt-3'>



                        {createEditPage &&
                            <>
                                <div className='text-center mb-2'>
                                    <h1><b>Analiz Tanımlama</b></h1>
                                    <span style={{ fontSize: 18 }}>Analiz bilgilerinizi sisteme tanıtın.</span>
                                </div>



                            </>
                        }
                    </div>
                    {!createEditPage &&
                        <div className='card'>
                            <DataTable Refresh={refreshDatatable} DataUrl={"SampleExamination/GetAllSampleExaminationByCurrentTopic"} Headers={[
                                ["name", "Analiz Adı"],
                                ["sampleMethod", "Analiz Metodu"],
                                ["sampleExaminationDevicesCount", "Cihaz Adet"],
                                ["sampleExaminationPriceCurrencies.price", "Cihaz Adet","price|price","currenyTypeName"],


                                {
                                    header: "Analiz Sonuç Değerleri Tanımla",
                                    dynamicButton: (d) => {

                                        return <button className='btn btn-sm btn-outline-success' onClick={(x) => { setSelectedExamination(d); toggleSetREsultValueModal(); }}><i className='fa fa-percent mr-1'></i> <b>DeğerTanımla <span>({d.laboratoryUserCount})</span></b></button>
                                    }
                                }

                            ]} Title={"Kayıtlı Analiz Listesi"}
                                Description={"Analiz tanımlayıp, tanımladığınız Analizlara görevli atama işlemi yapabilirsiniz."}
                                HeaderButton={{ text: "Analiz Ekle", action: () => { setInitialValues({}); toggleModal(true);setModelCurrencies([]) } }}
                                EditButton={editData}
                                DeleteButton={deleteData}
                            ></DataTable>
                        </div>
                    }
                </div>
            </Layout>
        </>
    )
}