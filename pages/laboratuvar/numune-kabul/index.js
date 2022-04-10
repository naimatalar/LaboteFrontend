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
import SetUserOnLanoratory from '../../../components/setUserOnLanoratory';
import SetDeviceOnLanoratory from '../../../components/setDeviceOnLaboratory';
import ReactSelect from 'react-select';
import { getLaboratoryFromStorage } from '../../../components/localStorage';
const isBrowser = typeof window === 'undefined'
export default function Index() {
    const [createEditPage, setCreateEditPage] = useState(false)
    const [initialValues, setInitialValues] = useState({ id: null, name: "", description: "", code: "" })
    const [refreshDatatable, setRefreshDatatable] = useState(new Date())
    const [selectedLaboratory, setSelectedLaboratory] = useState();
    const [loading, setLoading] = useState(true)
    // Modal open state
    const [modal, setModal] = React.useState(false);
    const [showCustomerList, setShowCustomerList] = React.useState(false);
    const [customerList, setCustomerList] = React.useState([]);
    const [customerLabel, setCustomerLabel] = React.useState("");
    const [examinationSelectList, setExaminationSelectList] = React.useState([]);
    const [examinationValues, setExaminationValues] = React.useState([]);
    const [selectedExaminationValues, setSelectedExaminationValues] = React.useState({});
    const [refreshPage, setRefreshPage] = useState(new Date())
    const [selectSample, setSelectSample] = useState({})
    const [laboatoryList, setLaboratoryList] = useState([])



    const toggleModal = () => { if (laboatoryList.length==0) { setLaboratoryListFunc(); } setModal(!modal);  }
    const [modalSetUser, setModalSetUser] = React.useState(false);
    const toggleSetUserModal = () => { setModalSetUser(!modalSetUser); if (!modalSetUser) { setRefreshDatatable(new Date()) } };
    const [modalBarcode, setModaBarcode] = React.useState(false);
    const toggleBarcodeModal = () => { setModaBarcode(!modalBarcode); if (modalBarcode) { setRefreshDatatable(new Date()) } };

    useEffect(() => {

        start();
    }, [])

    const start = async () => {

        setLoading(false)
    }
    const setLaboratoryListFunc = async () => {
        var d = await GetWithToken("Laboratory/GetLaboratoryListByCurrentUser").then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setLaboratoryList(d.data)
    }
    const getCustomerFunc = async (q) => {
        var d = await GetWithToken("CurrentCustomer/GetAllCurrentCustomerByName/" + q).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setCustomerList(d.data)

    }

    const getExaminationDelectFunc = async (q) => {

        var d2 = await GetWithToken("SampleExamination/GetSampleExaminationByQuery/" + q).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        var mmp = d2.data.map((item, key) => {
            return { label: item.name, value: item.id }
        })

        setExaminationSelectList(mmp)

    }

    const setExaminationValuesFun = async () => {
        var ddata = examinationValues
        var isExist = ddata.filter((x) => { return x.value == selectedExaminationValues.value }).length > 0
        if (!isExist) {
            ddata.push(selectedExaminationValues)
            setExaminationValues(ddata)
            setRefreshPage(new Date())

        }
    }
    const removeExaminationItem = async (item) => {
        var ddata = examinationValues.filter((x) => { return x != item })


        setExaminationValues(ddata)
        setRefreshPage(new Date())


    }
    const deleteFunc = async (val) => {

    }
    const submit = async (val) => {


        if (val.id == undefined) {

            var data = await PostWithToken("SampleAccept/CreateSampleAccepted", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }

        } else {
            var d = await PostWithToken("SampleAccept/CreateSampleAccepted", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
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

        var d = await GetWithToken("SampleAccept/GetAllSampleAcceptById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setInitialValues(d.data)
        setCustomerLabel(d.data.currentCustomerName)
        setExaminationValues(d.data.sampleExaminationSampleAcceptsSelectList)
        toggleModal()
        

    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Laboratuvar" map={[
                    { url: "", name: "Laboratuvar" },
                    { url: "numune-kabul", name: "Numune Kabul" }]}>
                </PageHeader>
                <Modal isOpen={modal}
                    size="lg"
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>

                    <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center mb-2">
                        </div>
                        <div className="d-flex ">
                            <p>Numune Kabul Formu</p>
                        </div>
                        <button onClick={toggleModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>
                    </ModalHeader>  <ModalBody>

                        <Formik
                            initialValues={initialValues}
                            validate={values => {
                                const errors = {};

                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {

                                values.sampleExaminationIds = examinationValues.map((i, k) => { return i.value });
                                setTimeout(async () => {
                                    await submit(values)
                                    setSubmitting(false);
                                }, 400);
                            }}
                        >
                            {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values }) => (
                                <Form className='row mt-3 col-12 form-n-popup' >
                                    {initialValues && <>
                                        {/* CurrentCustomerId = model.CurrentCustomerId,
                                        LaboteUserId = userId,
                                        SampleAcceptPackaging = (Enums.SampleAcceptPackaging)model.SampleAcceptPackaging,
                                        SampleAcceptStatus = (Enums.SampleAcceptStatus)model.SampleAcceptStatus,
                                        SampleReturnType = (Enums.SampleReturnType)model.SampleReturnType, */}

                                        <ErrorMessage name="id" component="div" className='text-danger' />
                                        <Field type="hidden" name="id" />
                                        <Field type="hidden" name="currentCustomerId" />
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="sampleName" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Adı</label>
                                            <Field type="text" id="sampleName" className="form-control" name="sampleName" />
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="brand" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Marka</label>
                                            <Field type="text" id="brand" className="form-control" name="brand" />
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="brand" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>İlgili Laboratuvar</label>
                                            <select className='form-control' onChange={handleChange} onBlur={handleBlur} name="laboratoryId" value={values.laboratoryId}>
                                                <option>Seçiniz</option>

                                                {laboatoryList.map((item, key) => {
                                                    return <option key={key} value={item.id}>{item.name}</option>
                                                })}
                                            </select>
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <b className='text-danger'>Listede sadece yetkili olduğunuz laboratuvarlar görebilirsiniz.</b><br></br>
                                            <i className='text-warning'>Eğer seçmeniz gereken laboratuvar listede yoksa yöneticinize danışınız!</i>
                                        </div>

                                        <div className='col-12 mb-4 row' style={{
                                            border: "1px solid #939393",
                                            borderRadius: "11px"
                                        }}>
                                            <ErrorMessage name="serialNo" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Uygulanacak Analizler</label>

                                            <div className='col-10'>
                                                <ReactSelect
                                                    isClearable
                                                    onInputChange={(x) => { getExaminationDelectFunc(x) }}
                                                    styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
                                                    onChange={(x) => { setSelectedExaminationValues(x) }}
                                                    options={examinationSelectList}>

                                                </ReactSelect>
                                            </div>
                                            <div className='col-2'>
                                                <button type='button' onClick={() => { setExaminationValuesFun() }} className='btn btn-outline-info p-0 pl-4 pr-4 pt-1 pb-1'>Ekle</button>
                                            </div>

                                            <div className='col-12 mt-1' style={{ height: 38 }}>
                                                {examinationValues.map((item, key) => {
                                                    return <label key={key} className='examination-select-item' onClick={() => { removeExaminationItem(item) }}>{item.label} <span className='examination-item-close-button'><i style={{ fontSize: 12 }} className='fa fa-times'></i></span></label>
                                                })}
                                            </div>
                                        </div>



                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="serialNo" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Seri Numarası</label>
                                            <Field type="text" id="serialNo" className="form-control" name="serialNo" />
                                        </div>


                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="sampleAcceptBringingType" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Teslim Alma Türü</label>
                                            <select value={values.sampleAcceptBringingType} name='sampleAcceptBringingType' className='form-control' onChange={handleChange} onBlur={handleBlur} >
                                                <option>
                                                    Seçiniz
                                                </option>
                                                <option value={1}>
                                                    Kargo
                                                </option>
                                                <option value={2}>
                                                    Elden Teslim
                                                </option>
                                            </select>
                                        </div>


                                        <div className='col-12 mb-4 row'>
                                            <div className='col-11 '>
                                                <ErrorMessage name="sampleAcceptBringingType" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Numune Cari</label>
                                                <input value={customerLabel} type={"text"} className="form-control"></input>
                                            </div>
                                            <div className='col-1 text-right'>
                                                <button type='button' className='btn btn-outline-info' onClick={() => { getCustomerFunc(""); setShowCustomerList(true) }}>...</button>
                                            </div>
                                            <div className='row justify-content-center'>

                                            </div>


                                        </div>
                                        {
                                            showCustomerList &&
                                            <div className='customer-container-select p-3'>
                                                <button style={{
                                                    position: "absolute",
                                                    right: "1px",
                                                    top: "0px"
                                                }} type='button' className='btn btn-danger btn-sm' onClick={(x) => { getCustomerFunc(""); setShowCustomerList(false) }}><i className='fa fa-times'></i></button>
                                                <div className='col text-center mt-2 mb-2' style={{ fontSize: 18 }}><b>Cari hesaplar listesi</b></div>
                                                <input placeholder='Aramak minimum için 3 harf giriniz' onChange={(x) => x.target.value.length > 2 && getCustomerFunc(x.target.value)} type={"text"} className="form-control"></input>
                                                <table className='bbr-border mt-2 table table-hover '>
                                                    <thead>


                                                        <tr style={{ background: "grey" }}>
                                                            <td>Adı</td>
                                                            <td>Ünvan</td>
                                                            <td>Vergi No</td>
                                                            <td style={{ width: 65 }} className="text-center">#</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>


                                                        {customerList.map((item, key) => {
                                                            return <tr key={key}>
                                                                <td>{item.name}</td>
                                                                <td>{item.title}</td>
                                                                <td>{item.taxNumber}</td>
                                                                <td className='text-center'>
                                                                    <button onClick={(x) => { setFieldValue("currentCustomerId", item.id); setCustomerLabel(item.name + " - " + item.title + " - " + item.taxNumber); setShowCustomerList(false) }} className='btn btn-outline-success p-0 pl-2 pr-2'>Seç</button>
                                                                </td>

                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }

                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="sampleAcceptPackaging" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Paket Türü</label>
                                            <select value={values.sampleAcceptPackaging} name='sampleAcceptPackaging' className='form-control' onChange={handleChange} onBlur={handleBlur} >
                                                <option>
                                                    Seçiniz
                                                </option>
                                                <option value={1}>
                                                    Orjinal Ambalaj
                                                </option>
                                                <option value={2}>
                                                    Numune Kabı
                                                </option>
                                                <option value={3}>
                                                    Koli
                                                </option>
                                                <option value={4}>
                                                    Diğer
                                                </option>
                                            </select>
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="sampleReturnType" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Sonuç İşlemi</label>
                                            <select value={values.sampleReturnType} name='sampleReturnType' className='form-control' onChange={handleChange} onBlur={handleBlur} >
                                                <option>
                                                    Seçiniz
                                                </option>
                                                <option value={1}>
                                                    Mişteriye İade Edilecek
                                                </option>
                                                <option value={2}>
                                                    Arşivlenecek
                                                </option>
                                                <option value={3}>
                                                    İmha Edilecek
                                                </option>
                                            </select>
                                        </div>
                                        <div className='col-6 row mb-4 pr-0'>
                                            <div className='col-6'>
                                                <ErrorMessage name="quantity" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Miktar</label>
                                                <Field type="text" id="quantity" className="form-control" name="quantity" />

                                            </div>
                                            <div className='col-6 '>
                                                <ErrorMessage name="unitType" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Miktar Birimi</label>
                                                <Field type="text" id="unitType" className="form-control" name="unitType" />

                                            </div>
                                        </div>
                                        <div className='col-6 mb-4 ml-3'>
                                            <ErrorMessage name="manufactureDate" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Üretim Tarihi</label>
                                            <Field type="date" id="manufactureDate" className="form-control" name="manufactureDate" />
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="expirationDate" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Son Kullanma Tarihi</label>
                                            <Field type="date" id="expirationDate" className="form-control" name="expirationDate" />
                                        </div>
                                        <div className='col-6 mb-4'>
                                            <ErrorMessage name="acceptedDate" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Numune Kabul Tarih</label>
                                            <Field type="datetime-local" id="acceptedDate" className="form-control" name="acceptedDate" />
                                        </div>
                                        <div className='col-12 mb-4'>
                                            <ErrorMessage name="description" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Açıklama</label>
                                            <Field as="textarea" id="description" className="form-control" name="description" />
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

                <Modal isOpen={modalSetUser}
                    toggle={toggleSetUserModal}
                    modalTransition={{ timeout: 100 }}>
                    <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center mb-2">
                        </div>
                        <div className="d-flex ">
                            <p>Laboratuvar Kullanıcı Atama </p>
                        </div>
                        <button onClick={toggleSetUserModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                    </ModalHeader>    <ModalBody>


                        <div className='row col-12'>
                            <SetUserOnLanoratory laboratory={selectedLaboratory}></SetUserOnLanoratory>
                        </div>
                    </ModalBody>
                </Modal>

                <Modal isOpen={modalBarcode}
                    toggle={toggleBarcodeModal}
                    modalTransition={{ timeout: 100 }}>
                    <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center mb-2">
                        </div>
                        <div className="d-flex ">
                            <p> </p>
                        </div>
                        <button onClick={toggleBarcodeModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                    </ModalHeader>
                    <ModalBody>


                        <div className='row col-12'>
                            <div className='col-12'>
                                <div style={{ width: "288px", float: "left" }}>
                                    <img src={selectSample.barcodeImageString}></img>
                                    <div className='barcode-number'>{
                                        selectSample.barcode
                                    }</div>
                                </div>
                                <div style={{ width: "100px", float: "left" }}>

                                    <div style={{ width: "100%", float: "left" }}>
                                        {
                                            selectSample.sampleName
                                        }</div>
                                    <button type='button'>Yazdır</button>
                                </div>

                            </div>


                        </div>
                    </ModalBody>
                </Modal>

                <div className='content pr-3 pl-3'>
                    <div className='row justify-content-center mt-3'>



                        {createEditPage &&
                            <>
                                <div className='text-center mb-2'>
                                    <h1><b>Laboratuvar Tanımlama</b></h1>
                                    <span style={{ fontSize: 18 }}>Laboratuvar bilgilerinizi sisteme tanıtın.</span>
                                </div>



                            </>
                        }
                    </div>
                    {!createEditPage &&
                        <div className='card'>
                            <DataTable Refresh={refreshDatatable} DataUrl={"SampleAccept/GetAllSampleAcceptByLaboratoryId"} Headers={[
                                ["sampleName", "Numune Adı"],
                                ["brand", "Marka"],
                                ["sampleAcceptStatus", "Numunenin Durumu"],

                                ["viewAcceptedDate", "Kabul Tarihi"],
                                ["currentCustomer", "Numune Kabul Cari"],
                                {
                                    header: <span>Barkod Yazdır</span>,

                                    dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-info' title='Barkod Yazdır' onClick={(x) => { setSelectSample(data); toggleBarcodeModal(); }}><i className='fas fa-barcode'></i> {data.barcode} </button> }
                                }
                            ]} Title={<span><b>{getLaboratoryFromStorage()?.label}</b> Numune Listesi</span>}
                                Description={"Cari hesaplarda düzenleme ve ekleme işlemini burdan yapabilirsiniz"}
                                HeaderButton={{
                                    text: "Numune Kabul Oluştur", action: () => {
                                        toggleModal()
                                        setInitialValues({})
                                        setCustomerLabel("")
                                        setExaminationValues([])
                                    }
                                }}
                                EditButton={editData}
                                DeleteButton={deleteFunc}
                                Pagination={{ pageNumber: 1, pageSize: 10,laboratoryId:getLaboratoryFromStorage()?.value }}
                            ></DataTable>
                        </div>
                    }
                </div>
            </Layout>
        </>
    )
}