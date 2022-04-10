import React, { useEffect, useState } from 'react';
import { Col, ModalBody, ModalHeader,Modal, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import AlertFunction from '../../../../components/alertfunction';
import Layout from '../../../../layout/layout';
import PageHeader from '../../../../layout/pageheader';
import { GetWithToken, PostWithToken } from '../../../api/crud';
import classnames from 'classnames';
import { Form, Formik } from 'formik';

const isBrowser = typeof window === 'undefined'





function Index(props) {
    const [devicesWithdValueUnit, setDevicesWithValueType] = useState([])
    const [activeTab, setActiveTab] = useState({})
    const [selectedDevice, setSelectedDevice] = useState({})
    const [initialVal, setInitialVal] = useState({})
    const [pageRefresh, setPageRefresh] = useState(new Date())
    const [pageLoad, setPageLoad] = useState(false)
    const [modal, setModal] = useState(false)

    const toggleModal = () => { setModal(!modal); }


    useEffect(() => {
        start();

    }, [])


    const start = async () => {
        var ppp = ""
        if (!isBrowser) {
            var path = window.location.pathname.split("/")
            ppp = path[path.length - 1]
        }

        var d = await GetWithToken("Analysis/GetDeviceValueUnitByAnalisysCreateRecordId/" + ppp).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setDevicesWithValueType(d.data.list)
        console.log(d.data.list)
        activeTabFunc(d.data.list[d.data.list.length - 1], d.data.list[d.data.list.length - 1].devices[0])

    }
    const activeTabFunc = async (data, device) => {
        setPageLoad(false)
        var ppp = ""
        if (!isBrowser) {
            var path = window.location.pathname.split("/")
            ppp = path[path.length - 1]
        }

        var d = await GetWithToken("Analysis/GetDeviceValues/" + device.id + "/" + ppp).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })


        setActiveTab(data)
        setSelectedDevice(device)
        setInitialVal(JSON.parse(d.data))
        setPageRefresh(new Date())

        changeDevice(device)
        setPageLoad(true)
    }
    const changeDevice = async (jitem) => {

        var ppp = ""
        if (!isBrowser) {
            var path = window.location.pathname.split("/")
            ppp = path[path.length - 1]
        }

        var d = await GetWithToken("Analysis/GetDeviceValues/" + jitem.id + "/" + ppp).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setInitialVal(JSON.parse(d.data));

        setSelectedDevice(jitem)
        setPageRefresh(new Date())



    }
    const submit = async (val) => {
        var d = await PostWithToken("Analysis/SetDeviceValue", { data: val }).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            AlertFunction("İşlem Yapılamadı", d?.message)
        }

    }


    return (
        <>
            <Layout permissionControl={false}>
                <PageHeader title="Laboratuvar" map={[
                    { url: "", name: "Laboratuvar" },
                    { url: "analiz-olusturma", name: "Analiz Oluşturma" },
                    { url: "", name: "Analiz Veri Girişi" }
                ]}>

                </PageHeader>
                <Modal isOpen={modal}
                    size="lg"
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>

                    <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                        <div className="d-flex justify-content-center mb-2">
                        </div>
                        <div className="d-flex ">
                            <p>Rapor Tanımlama Formu</p>
                        </div>
                        <button onClick={toggleModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>
                    </ModalHeader>
                    <ModalBody>

                    </ModalBody>

                </Modal>
                <div className='content'>
                    <div className='card mt-3'>
                        <div className='tabbed'>
                            <ul>
                                <li className='exclude-list' style={{ float: 'left' }}>Uygulanacak Analiz <i className='ml-3 fa fa-arrow-circle-right'></i></li>
                                {
                                    devicesWithdValueUnit.map((item, key) => {
                                        return <li key={key} onClick={() => { activeTabFunc(item, item.devices[0]); }} className={classnames({ active: activeTab === item })}>


                                            {item.sampleExaminationName}
                                        </li>

                                    })
                                }
                            </ul>
                        </div>



                        <div className="tab-p-analisys">


                            {/* // devicesWithdValueUnit.map((item, key) => {
                                //     if (item.id != activeTab) {
                                //         return null
                                //     }

                                //     return ( */}
                            <div>
                                <Row className='justify-content-between'>

                                    <Col lg="6" style={{ borderRight: "1px solid #cacaca" }}>
                                        <div className='col-12 mb-3 p-0'><b className='text-warning'>Kullandığınız cihazı seçerek cihazın sonuçları giriniz</b></div>
                                        {
                                            activeTab.devices?.map((jitem, jkey) => {
                                                return <button style={{ position: "relative", fontWeight: "bold" }} className={(jitem.id == selectedDevice?.id && "active-dev-tab") + " mr-2 p-2"} onClick={(x) =>

                                                    activeTabFunc(activeTab, jitem)
                                                } type='button'>{jitem.name}
                                                    {jitem.id == selectedDevice?.id && <i className='fa fa-arrow-up fr-select-arrow'></i>}
                                                </button>
                                            })
                                        }

                                        {pageLoad &&
                                            <Formik
                                                initialValues={initialVal}
                                                validate={values => {
                                                    const errors = {};

                                                    return errors;
                                                }}
                                                onSubmit={(values, { setSubmitting }) => {
                                                    var ppp = ""
                                                    if (!isBrowser) {
                                                        var path = window.location.pathname.split("/")
                                                        ppp = path[path.length - 1]
                                                    }
                                                    values.createAnalisysRecordId = ppp;
                                                    values.deviceId = selectedDevice.id;
                                                    setTimeout(async () => {
                                                        await submit(values)
                                                        setSubmitting(false);
                                                    }, 400);
                                                }}>

                                                {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values, initialValues }) => (
                                                    <Form className='row mt-3 col-12 form-n-popup' >
                                                        {/* <p>{JSON.stringify(initialVal)}</p> */}
                                                        {/* <p>{JSON.stringify(values)}</p> */}


                                                        {
                                                            selectedDevice?.deviceResultValueType?.map((kitem, kkey) => {

                                                                if (kitem.measureUnitType == 1) {
                                                                    return <div className='col-6 mt-4' key={kkey}>
                                                                        <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                        <input name={kitem.id} value={values[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number"></input>

                                                                    </div>
                                                                }
                                                                if (kitem.measureUnitType == 2) {
                                                                    return <div className='col-6 mt-4' key={kkey}>
                                                                        <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                        <input name={kitem.id} value={values[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number" ></input>

                                                                    </div>
                                                                }
                                                                if (kitem.measureUnitType == 3) {
                                                                    return <div className='col-6 mt-4' key={kkey}>
                                                                        <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                        <input name={kitem.id} value={values[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="number" ></input>

                                                                    </div>
                                                                }
                                                                if (kitem.measureUnitType == 4) {
                                                                    return <div className='col-6 mt-4' key={kkey}>
                                                                        <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                        <input name={kitem.id} value={values[kitem.id]} onChange={handleChange} onBlur={handleBlur} className='device-value-input' max={100} type="text" ></input>

                                                                    </div>
                                                                }


                                                            })
                                                        }
                                                        <Col lg="12" className='mt-2 mb-3'>
                                                            <button type='submit' className='btn btn-outline-success'><i className='fa fa-save'></i> Kaydet</button>
                                                        </Col>
                                                    </Form>
                                                )}

                                            </Formik>}

                                    </Col>



                                    <Col lg="5">

                                        <fieldset className='fl-set-text'>
                                            <legend><b style={{ fontSize: 15 }}>Analiz Detayları</b></legend>
                                            <div className='row info-font-size'>

                                                <div className='col-12 row mb-3'>

                                                    <div className='col-6 row aling-left-all'>
                                                        <div className='col-12 pl-3 row'>
                                                            <div className='col-12 p-0'>Analiz: <b>{activeTab.sampleExaminationName}</b></div>
                                                            <div className='col-12 p-0'>Numune: <b>{activeTab.sampleName}</b></div>
                                                            <div className='col-12 p-0'>Metod: <b>{activeTab.sampleMethod}</b></div>

                                                        </div>
                                                    </div>

                                                    <div className='col-6 col-6 row justify-content-center'>
                                                        <div className='col-8 p-0'>
                                                            <div className='col-12 p-0'><img style={{ width: "100%" }} src={activeTab.barcodeImage}></img>
                                                                <div style={{ width: "100%", letterSpacing: 5 }}>{activeTab.sampleAcceptBarcode}</div>
                                                            </div>

                                                        </div>
                                                    </div>


                                                </div>
                                                <div className='col-6  mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Uygulanacak Analiz</div>
                                                        <div className='col-12 p-0'>{activeTab.sampleExaminationName}</div>

                                                    </div>
                                                </div>
                                                <div className='col-6 mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Numune Kabul Tarihi</div>
                                                        <div className='col-12 p-0'>{activeTab.acceptedDate}</div>
                                                    </div>
                                                </div>

                                                <div className='col-6 mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Analiz Sonu Aksiyon</div>
                                                        <div className='col-12 p-0'>{activeTab.sampleAcceptedReturnType}</div>
                                                    </div>
                                                </div>
                                                <div className='col-6 mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Seri No</div>
                                                        <div className='col-12 p-0'>{activeTab.sampleAcceptedSerialNo}</div>
                                                    </div>
                                                </div>
                                                <div className='col-6 mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Miktar</div>
                                                        <div className='col-12 p-0'>{activeTab.sampleAcceptedQuantity + " " + activeTab.sampleAcceptUnitType}</div>
                                                    </div>
                                                </div>
                                                <div className='col-6 mb-3'>
                                                    <div className='col-12 p-0'>
                                                        <div className='col-12 p-0 sa-title'>Numuney Kabul Oluşturan</div>
                                                        <div className='col-12 p-0'>{activeTab.sampleAcceptLaboteUser}</div>
                                                    </div>
                                                </div>

                                            </div>
                                        </fieldset>
                                        <Row className='col-12 row justify-content-end'>
                                            <button onClick={()=>{toggleModal()}} className='btn btn-outline-info ml-4'><i className='fas fa-file'></i> Raporu Tamamla</button>

                                        </Row>
                                    </Col>

                                </Row>
                            </div>


                        </div>

                    </div>

                </div>
            </Layout>
        </>)
}

export default Index;