import { ErrorMessage, Field, Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from 'reactstrap';
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
    const [initialValues, setInitialValues] = useState({})
    const [refreshDatatable, setRefreshDatatable] = useState(new Date())
    const [selectedLaboratory, setSelectedLaboratory] = useState();
    const [loading, setLoading] = useState(true)
    // Modal open state
    const [modal, setModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(1);

    const toggleModal = () => setModal(!modal);
    const [modalSetUser, setModalSetUser] = React.useState(false);
    const toggleSetUserModal = () => { setModalSetUser(!modalSetUser); if (modalSetUser) { setRefreshDatatable(new Date()) } };
    const [modalDevice, setModaDevice] = React.useState(false);
    const toggleDeviceModal = () => { setModaDevice(!modalDevice); if (modalDevice) { setRefreshDatatable(new Date()) } };
    useEffect(() => {

        start();
    }, [])

    const start = async () => {

        setLoading(false)
        // var laborat = await GetWithToken("Laboratory/GetCurrentTopicLaboratory").then(x => { return x.data }).catch(x => { return false })
        // var roleSelectList = []
        // setRoles(roleSelectList)
    }
    const deleteFunc = async () => {


    }
    const submit = async (val) => {


        if (val.id == undefined) {

            var data = await PostWithToken("CurrentCustomer/CreateCurrentCustomer", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

            if (data.isError) {
                AlertFunction("İşlem Yapılamadı", data?.message)
            }

        } else {

            var d = await PostWithToken("CurrentCustomer/CreateCurrentCustomer", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
            if (d.isError) {
                AlertFunction("İşlem Yapılamadı", d?.message)
            }
        }

        setRefreshDatatable(new Date())
        toggleModal();
        setActiveTab(1)
       

    }
    const deleteData = async (data) => {
        var d = await GetWithToken("Laboratory/delete/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        if (d.isError) {
            AlertFunction("İşlem Yapılamadı", d?.message)
        }
        setRefreshDatatable(new Date())
    }


    const editData = async (data) => {


        var d = await GetWithToken("CurrentCustomer/GetAllCurrentCustomerById/" + data.id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setInitialValues(d.data)
        setRefreshDatatable(new Date())

        toggleModal();

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
                            <p>Cari Hesap Oluşturma Formu</p>
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

                                        <div className='row col-12'>
                                            <ul className='row bbls p-0 pl-3'>
                                                <li>
                                                    <button type='button' onClick={() => { setActiveTab(1) }} className={(activeTab == 1 && "active-customer-inf-tab") + " mr-2 "}>Genel Bilgiler</button>
                                                </li>
                                                <li>
                                                    <button type='button' onClick={() => { setActiveTab(2) }} className={(activeTab == 2 && "active-customer-inf-tab") + " mr-2 "}>İletişim Bilgileri</button>
                                                </li>
                                                <li>
                                                    <button type='button' onClick={() => { setActiveTab(3) }} className={(activeTab == 3 && "active-customer-inf-tab") + " mr-2 "}>Banka Hesap Bilgileri</button>
                                                </li>
                                            </ul>
                                        </div>

                                        <ErrorMessage name="id" component="div" className='text-danger' />

                                        {activeTab == 3 && <>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerBankAccountInfos.bankName" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Banka Adı</label>
                                                <Field type="text" id="currentCustomerBankAccountInfos.bankName" className="form-control" name="currentCustomerBankAccountInfos.bankName" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerBankAccountInfos.bankMerchant" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Banka Şubesi</label>
                                                <Field type="text" id="currentCustomerBankAccountInfos.bankMerchant" className="form-control" name="currentCustomerBankAccountInfos.bankMerchant" />
                                            </div>
                                            <div className='col-12 mb-3'>
                                                <ErrorMessage name="currentCustomerBankAccountInfos.iban" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Iban</label>
                                                <Field type="text" id="currentCustomerBankAccountInfos.iban" className="form-control" name="currentCustomerBankAccountInfos.iban" />
                                            </div>

                                        </>}

                                        {activeTab == 2 && <>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.webSite" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Web Site</label>
                                                <Field type="text" id="currentCustomerContactInfos.webSite" className="form-control" name="currentCustomerContactInfos.webSite" />
                                            </div>

                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.mailAddress1" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>E Mail </label>
                                                <Field type="text" id="currentCustomerContactInfos.mailAddress1" className="form-control" name="currentCustomerContactInfos.mailAddress1" />
                                            </div>

                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.mailAddress2" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>E Mail 1</label>
                                                <Field type="text" id="currentCustomerContactInfos.mailAddress2" className="form-control" name="currentCustomerContactInfos.mailAddress2" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.mailAddress3" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>E Mail 2</label>
                                                <Field type="text" id="currentCustomerContactInfos.mailAddress3" className="form-control" name="currentCustomerContactInfos.mailAddress3" />
                                            </div>


                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.phone1" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Telefon</label>
                                                <Field type="text" id="currentCustomerContactInfos.phone1" className="form-control" name="currentCustomerContactInfos.phone1" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.phone2" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Telefon 1</label>
                                                <Field type="text" id="currentCustomerContactInfos.phone2" className="form-control" name="currentCustomerContactInfos.phone2" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.phone3" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Telefon 2</label>
                                                <Field type="text" id="currentCustomerContactInfos.phone3" className="form-control" name="currentCustomerContactInfos.phone3" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.country" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>İl</label>
                                                <Field type="text" id="currentCustomerContactInfos.country" className="form-control" name="currentCustomerContactInfos.country" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.city" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>İlçe</label>
                                                <Field type="text" id="currentCustomerContactInfos.city" className="form-control" name="currentCustomerContactInfos.city" />
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.neighborhood" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Semt/Mahalle</label>
                                                <Field type="text" id="currentCustomerContactInfos.neighborhood" className="form-control" name="currentCustomerContactInfos.neighborhood" />
                                            </div>
                                            <div className='col-12 mb-3'>
                                                <ErrorMessage name="currentCustomerContactInfos.fullAddress" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Adres</label>
                                                <Field as="textarea" id="currentCustomerContactInfos.fullAddress" className="form-control" name="currentCustomerContactInfos.fullAddress" />
                                            </div>
                                        </>}


                                        {activeTab == 1 && <>

                                            <Field type="hidden" name="id" />
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="name" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Cari Hesap Adı</label>
                                                <Field type="text" id="name" className="form-control" name="name" />
                                            </div>

                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="title" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Ünvanı</label>
                                                <Field type="text" name="title" className="form-control">
                                                </Field>
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="taxNumber" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Vergi Numarası</label>
                                                <Field type="text" name="taxNumber" className="form-control">
                                                </Field>
                                            </div>
                                            <div className='col-6 mb-3'>
                                                <ErrorMessage name="taxAgency" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Vergi Dairesi</label>
                                                <Field type="text" name="taxAgency" className="form-control">
                                                </Field>
                                            </div>
                                            <div className='col-12 mb-3'>
                                                <ErrorMessage name="officialAgent" component="div" className='text-danger danger-alert-form' />
                                                <label className='input-label'>Yetkili Kişi</label>
                                                <Field type="text" name="officialAgent" className="form-control">
                                                </Field>
                                            </div>
                                        </>}
                                        <div className='row col-12'>
                                            <ModalFooter>

                                                <button type='submit' style={{ width: 110 }} disabled={isSubmitting} className={"btn btn-primary btn-block loading-button" + (isSubmitting && " loading-button")}><span>Kaydet <i className="icon-circle-right2 ml-2"></i></span></button>

                                                <button type='button' style={{ width: 110, marginTop: 0 }} onClick={() => { toggleModal() }} className={"btn btn-warning btn-block "}><span>Kapat <i className="fas fa-undo ml-2"></i></span></button>

                                            </ModalFooter>
                                        </div>


                                    </>}
                                </Form>
                            )}
                        </Formik>

                    </ModalBody>
                </Modal>



                {/* <Modal isOpen={modalDevice}
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
                </Modal> */}

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
                            <DataTable Refresh={refreshDatatable} DataUrl={"CurrentCustomer/GetAllCurrentCustomer"} Headers={[
                                ["name", "Cari Hesap Adı"],
                                ["title", "Ticari Ünvan"],
                                ["taxNumber", "Vergi Numarsı"],
                                ["taxAgency", "Vergi Dairesi"],
                                ["viewCreateDate", "Oluşturulma Tarihi"],
                                // {
                                //     header: <><span style={{ cursor: 'pointer' }} data-for='tltip'>Düzenle &nbsp; </span></>,

                                //     dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-success' type='button' title='Stok Ve Fiyat Güncelleme' onClick={(x) => { setEditInitialData({ quantity: data.quantity, productName: data.productName, salePrice: data.salePrice, listPrice: data.listPrice, id: data.id }); setEditModalOpen(true); }}><i className='fas fa-edit'></i> Güncelle</button> }
                                // },
                                // {
                                //     header: <><span style={{ cursor: 'pointer' }} data-for='tltip'>Detay &nbsp; <i className='fa fa-info-circle'></i> </span><ReactTooltip backgroundColor='#c4ff4f' textColor='black' id='tltip'><span>Bu buton ürünün sanalpazarlardaki durumunu ve ürün hakkındaki detayların bulunduğu sayfaya yönlendirir</span></ReactTooltip></>,

                                //     dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-info' title='Ürünün sanalpazarlardaki durumu' onClick={(x) => { router.push({ pathname: 'urun-listesi/urun-ekle/', query: { variantGroupId: data.variantGroupId } }) }}><i className='fas fa-search'></i> İncele</button> }
                                // }


                            ]} Title={"Cari Hesap Listesi"}
                                Description={"Cari hesaplarda düzenleme ve ekleme işlemini burdan yapabilirsiniz"}
                                HeaderButton={{
                                    text: "Cari Hesap Oluştur", action: () => {
                                        setModal(true)
                                        setInitialValues({})
                                    }
                                }}
                                EditButton={editData}
                                DeleteButton={deleteFunc}
                                Pagination={{ pageNumber: 1, pageSize: 10 }}
                            ></DataTable>
                        </div>
                    }
                </div>
            </Layout>
        </>
    )
}