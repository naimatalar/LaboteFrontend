import React, { useState } from 'react';
import { ModalBody, ModalHeader, Modal } from 'reactstrap';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import { getLaboratoryFromStorage } from '../../../components/localStorage';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import { PostWithToken } from '../../api/crud';
const isBrowser = typeof window === 'undefined'


function Index(props) {
    const [loading, setLoading] = useState(true)
    const [refreshDatatable, setRefreshDatatable] = useState(new Date())
    const [modalConfirm, setModalConfirm] = React.useState(false);
    const [selectSample, setSelectSample] = React.useState({});
    const [confirmDate, setConfirmDAte] = React.useState("");

    const toggleConfirmModal = () => { setModalConfirm(!modalConfirm) };


    const confirm = async () => {
        if (!confirmDate) {
            AlertFunction("Kayıt Yapılamaz", "Teslim alma tarihi girilmeden deval edilemez")
            return null
        }
        var val = {
            confirmDate: confirmDate,
            sampleAcceptId: selectSample.id
        }
        var data = await PostWithToken("analysis/ConfirmSample", val).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setConfirmDAte("")
        setModalConfirm(false)
        debugger
        if (!isBrowser) {
            
            window.location.replace("/laboratuvar/analiz-olusturma/"+data.data.analisysRecordId)
        }
    }


    return (
        <>
            <Modal isOpen={modalConfirm}
                toggle={toggleConfirmModal}
                modalTransition={{ timeout: 100 }}>
                <ModalHeader cssModule={{ 'modal-title': 'w-100 text-center' }}>
                    <div className="d-flex justify-content-center mb-2">
                    </div>
                    <div className="d-flex ">
                        <p>Numune Teslim Teyyidi </p>
                    </div>
                    <button onClick={toggleConfirmModal} type='button' className='modal-close-button btn btn-danger btn-sm p-1'><i className='fas fa-times'></i></button>

                </ModalHeader>
                <ModalBody>

                    <div className='row col-12 m-0'>
                        <div className='sample-example-submit-confirm'>

                            <div className='col-12 text-center mb-3'>
                                <b style={{ fontSize: 15,color:"red" }}>Analize başlamadan önce mumuneyi teslim aldığınızı teyyid ediniz</b>

                            </div>
                            <div className='row col-12'>
                                <div className='col-8'>
                                    <div className='col-12' style={{textDecoration:"underline"}}>
                                        <b>Numune Adı : </b>{selectSample.sampleName}
                                    </div>
                                    <div className='col-12' style={{textDecoration:"underline"}}><b>Numne Kabul Tarihi :</b> {selectSample.viewManufactureDate}</div>
                                    <div className='col-12' style={{textDecoration:"underline"}}><b>Numuneyi Kaydını Giren :</b> {selectSample.laboteUser}</div>
                                    <div className='col-12' style={{textDecoration:"underline"}}><b>Numune Sahibi Cari :</b> {selectSample.currentCustomer}</div>
                                </div>
                                <div className='col-4 text-center'>
                                    <i>Numune Barkodu</i>
                                    <img style={{ width: "100%" }} src={selectSample.barcodeImageString}></img>
                                    <div style={{
                                        fontSize: 12,
                                        letterSpacing: "6px",
                                        textAlign: "center"
                                    }}>
                                        {selectSample.barcode}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <form className='col-12 row justify-content-center pt-4 pb-4'>
                            <div className='col-5'>

                                <label className='input-label'>Teslim Alma Tarihi</label>
                                <input type={"datetime-local"} onChange={(x) => { setConfirmDAte(x.target.value) }} className="form-control"></input>
                            </div>
                            <div className='col-4'>

                                <button onClick={confirm} type='button' style={{ width: "100%" }} className='btn btn-outline-success'><i className='fa fa-check'></i> Onayla</button>
                            </div>
                        </form>
                    </div>
                </ModalBody>
            </Modal>

            <Layout>
                <PageHeader title="Laboratuvar" map={[
                    { url: "", name: "Laboratuvar" },
                    { url: "analiz-olusturma", name: "Analiz Oluşturma" }]}>
                </PageHeader>

                <div className='content pr-3 pl-3'>


                    <div className='card'>
                        <DataTable NoDataPlaceholder={"Analiz bekleyen numune bulunmuyor."} HideButtons Refresh={refreshDatatable} DataUrl={"Analysis/GetSampleAcceptByLaboratoryId"} Headers={[
                            ["sampleName", "Numune Adı"],
                            ["brand", "Marka"],
                            ["laboteUser", "Kabul Kaydını Yapan"],
                            ["currentCustomer", "Numune Kabul Cari"],
                            ["viewAcceptedDate", "Kabul Tarihi"],

                            {
                                header: <span>Analiz Oluştur</span>,

                                dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-info' title='Oluştur' onClick={(x) => { setSelectSample(data); toggleConfirmModal(); }}>Oluştur</button> }
                            }
                        ]} Title={<span><b>{getLaboratoryFromStorage()?.label}</b> Analize Hazır Numune Listesi</span>}
                            Description={<><b>{getLaboratoryFromStorage()?.label}</b> adlı laboratuvar için analize başlayacağınız numuneyi, listede karşılık gelen <b>Oluştur</b> butonuna tıklayarak analiz kaydı oluşturabilirsiniz</>}
                            // HeaderButton={{
                            //     text: "Numune Kabul Oluştur", action: () => {
                            //         setModal(true)
                            //         setInitialValues({})
                            //         setCustomerLabel("")
                            //         setExaminationValues([])
                            //     }
                            // }}

                            Pagination={{ pageNumber: 1, pageSize: 10, laboratoryId: getLaboratoryFromStorage()?.value }}
                        ></DataTable>
                    </div>

                </div>
            </Layout>
        </>)
}

export default Index;