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

export default function Index() {
    const [createEditPage, setCreateEditPage] = useState(false)
    const [initialValues, setInitialValues] = useState({ id: null, name:"",description:"" })



    const [refreshDatatable, setRefreshDatatable] = useState(null)


    const [loading, setLoading] = useState(true)

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
 
    const submit = async (val) => {

      
        if (val.id == undefined) {
            var data = await PostWithToken("AntegraMerchant/CreateAntegraMerchant", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }
        } else {
            var d = await PostWithToken("AntegraMerchant/CreateAntegraMerchant", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
            if (d.isError) {
                AlertFunction("İşlem Yapılamadı",d?.message)
            }
        }

        setRefreshDatatable(new Date())
        toggleModal();


    }
    const deleteData = async (data) => {
        var d = await GetWithToken("AntegraMerchant/delete/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            AlertFunction("İşlem Yapılamadı",d?.message)
        }
        setRefreshDatatable(new Date())
    }


    const editData = async (data) => {
   

        var d = await GetWithToken("AntegraMerchant/GetById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setInitialValues(d.data)
        toggleModal(true);

    }

    return (
        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Yönetimsel Araçlar" map={[
                    { url: "", name: "Yönetimsel Araçlar" },
                    { url: "bayi-tanimlari", name: "Bayi Tanimlari" }]}>

                </PageHeader>


                <Modal isOpen={modal}
                    toggle={toggleModal}
                    modalTransition={{ timeout: 100 }}>
                    <ModalBody>
                        <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <div className="d-flex justify-content-center mb-2">
                          
                            </div>
                            <div className="d-flex ">
                                <p>Bayi <b>Tanımlama</b> Formu</p>
                            </div>
                        </ModalHeader>
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
                                values.marketPlaceKind = parseInt(values.marketPlaceKind)
                                setTimeout(async () => {

                                    submit(values)


                                    setSubmitting(false);
                                }, 400);
                            }}
                        >
                            {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values }) => (
                                <Form className='row mt-3 col-12 form-n-popup' >

                                    <ErrorMessage name="id" component="div" className='text-danger' />
                                    <Field type="hidden" name="id" />

                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="name" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Bayi Adı</label>
                                        <Field type="text" id="name" className="form-control" name="name" />
                                    </div>

                                    <div className='col-12 mb-3'>

                                        <ErrorMessage name="description" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Bayi Açıklama</label>
                                        <Field as="textarea" name="description"  className="form-control">

                                        </Field>
                                        {/* <textarea type="text" id="description" className="form-control" onChange={handleChange} onBlur={handleBlur} ></textarea> */}


                                    </div>





                                    <div className='row col-12 mt-4'>
                                        <div className='col-3'>
                                            <button type='submit' disabled={isSubmitting } className={"btn btn-primary btn-block loading-button" + (isSubmitting && " loading-button")}><span>Kaydet <i className="icon-circle-right2 ml-2"></i></span></button>
                                        </div>
                                        <div className='col-3'>
                                            <button type='button' onClick={() => { toggleModal() }} className={"btn btn-warning btn-block "}><span>Kapat <i className="fas fa-undo ml-2"></i></span></button>
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
                                    <h1><b>Bayi Tanımlama</b></h1>
                                    <span style={{ fontSize: 18 }}>Bayi bilgilerinizi sisteme tanıtın.</span>
                                </div>



                            </>
                        }
                    </div>
                    {!createEditPage &&
                        <div className='card'>
                            <DataTable Refresh={refreshDatatable} DataUrl={"AntegraMerchant/GetAllCurrentAntegraMerchant"} Headers={[
                                ["name", "Bayi Adı"],
                                ["description", "Bayi Açıklama"],


                            ]} Title={"Kayıtlı BayiListesi"}
                                Description={"Bayi tanımladıktan sonra bayileriniz sanal pazar entegrasyonunu gerçekleştirebilirsiniz."}
                                HeaderButton={{ text: "Bayi Ekle", action: () => {  setInitialValues({}); toggleModal(true); } }}
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