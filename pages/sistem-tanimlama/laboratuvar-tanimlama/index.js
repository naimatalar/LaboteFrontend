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
const isBrowser = typeof window === 'undefined'
export default function Index() {
    const [createEditPage, setCreateEditPage] = useState(false)
    const [initialValues, setInitialValues] = useState({ id: null, name: "", description: "", code: "" })
    const [refreshDatatable, setRefreshDatatable] = useState(new Date())
    const [selectedLaboratory, setSelectedLaboratory] = useState();
    const [loading, setLoading] = useState(true)
    // Modal open state
    const [modal, setModal] = React.useState(false);
 
    const toggleModal = () => setModal(!modal);
    const [modalSetUser, setModalSetUser] = React.useState(false);
    const toggleSetUserModal = () => {setModalSetUser(!modalSetUser); if(modalSetUser){setRefreshDatatable(new Date())}};
    const [modalDevice, setModaDevice] = React.useState(false);
    const toggleDeviceModal = () => {setModaDevice(!modalDevice) ;if(modalDevice){setRefreshDatatable(new Date())}};
    useEffect(() => {

        start();
    }, [])

    const start = async () => {

        setLoading(false)
        // var laborat = await GetWithToken("Laboratory/GetCurrentTopicLaboratory").then(x => { return x.data }).catch(x => { return false })
        // var roleSelectList = []
        // setRoles(roleSelectList)
    }

    const submit = async (val) => {


        if (val.id == undefined) {

            var data = await PostWithToken("Laboratory/CreateLaboratory", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }
            if (!isBrowser) {
                if (data.data.refres) {
                    window.location.reload();
                }
            }
        } else {
            var d = await PostWithToken("Laboratory/CreateLaboratory", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
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


        var d = await GetWithToken("Laboratory/GetById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setInitialValues(d.data)
        toggleModal(true);

    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Sistem & Tanımlama" map={[
                    { url: "", name: "Sistem & Tanımlama" },
                    { url: "laboratuvar-tanimlari", name: "Laboratuvar Tanimlari" }]}>

                </PageHeader>


                <Modal isOpen={modal}
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>
                  <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <div className="d-flex justify-content-center mb-2">
                            </div>
                            <div className="d-flex ">
                                <p>Laboratuvar <b>Tanımlama</b> Formu</p>
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
                                        <div className='col-6 mb-3'>
                                            <ErrorMessage name="name" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Laboratuvar Adı</label>
                                            <Field type="text" id="name" className="form-control" name="name" />
                                        </div>

                                        <div className='col-12 mb-3'>
                                            <ErrorMessage name="description" component="div" className='text-danger danger-alert-form' />
                                            <label className='input-label'>Laboratuvar Açıklama</label>
                                            <Field as="textarea" name="description" className="form-control">
                                            </Field>
                                            {/* <textarea type="text" id="description" className="form-control" onChange={handleChange} onBlur={handleBlur} ></textarea> */}

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

                <Modal isOpen={modalDevice}
                    toggle={toggleDeviceModal}
                    modalTransition={{ timeout: 100 }}>
                       <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <div className="d-flex justify-content-center mb-2">
                            </div>
                            <div className="d-flex ">
                                <p>Laboratuvar Cihazları Atama </p>
                            </div>
                            <button onClick={toggleDeviceModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                        </ModalHeader>   <ModalBody>
                  

                        <div className='row col-12'>
                            <SetDeviceOnLanoratory laboratory={selectedLaboratory}></SetDeviceOnLanoratory>
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
                            <DataTable Refresh={refreshDatatable} DataUrl={"Laboratory/GetCurrentTopicLaboratory"} Headers={[
                                ["name", "Laboratuvar Adı"],
                                {
                                    header: "Atanmış Kullanıcılar",
                                    dynamicButton: (d) => {

                                        return <button className='btn btn-sm btn-outline-success' onClick={(x) => { setSelectedLaboratory(d); toggleSetUserModal(); }}><i className='fa fa-users mr-1'></i> <b>Atanmış Kullanıcılar <span>({d.laboratoryUserCount})</span></b></button>
                                    }
                                },
                                {
                                    header: "Kullanılan Cihazlar",
                                    dynamicButton: (d) => {

                                        return <button className='btn btn-sm btn-outline-success' onClick={(x) => { setSelectedLaboratory(d); toggleDeviceModal(); }}><i className='fa fa-microchip  mr-1'></i> <b>Cihazları Gör <span>({d.deviceCount})</span></b></button>
                                    }
                                }

                            ]} Title={"Kayıtlı Laboratuvar Listesi"}
                                Description={"Laboratuvar tanımlayıp, tanımladığınız laboratuvarlara görevli atama işlemi yapabilirsiniz."}
                                HeaderButton={{ text: "Laboratuvar Ekle", action: () => { setInitialValues({}); toggleModal(true); } }}
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