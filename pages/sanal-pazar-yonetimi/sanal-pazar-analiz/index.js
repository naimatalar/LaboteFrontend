
import React, { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import AlertFunction from '../../../components/alertfunction';
import { getMerchantFromStrorage } from '../../../components/localStorage';
import OrderDetail from '../../../components/orderdetail';

import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';


export default function Index() {
    const [loading, setLoading] = useState(true);
    const [marketPlaceList, setMarketPlaceList] = useState([]);
    const [selectedMarketPlace, setSelectedMarketPlace] = useState({});
    const [selectedMarketPlaceEndpoints, setSelectedMarketPlaceEndpoints] = useState({});

    const [marketPlaceDetail, setMarketPlaceDetail] = useState({});
    const [jobScheduleTimeType, setJobScheduleTimeType] = useState();
    const [jobScheduleTime, setJobScheduleTime] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);
    const [dropdownTimes, setDropdownTimes] = useState({ hour: [], minute: [], day: [] });
    const [modalTime, setModalTime] = React.useState(false);
    const toggleModalTime = () => setModalTime(!modalTime);

    const [modalDetail, setModalDetail] = React.useState(false);
    const toggleModalDetail = () => setModalDetail(!modalDetail);


    useEffect(() => {
        start()
    }, [])

    const start = async () => {

        var d = await GetWithToken("MarketPlace/GetAllMarketPlaceByAntegraMerchantId/"+getMerchantFromStrorage()?.value).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })

        setMarketPlaceList(d.data)
        setLoading(false);
        var minute = []
        var hour = []
        var day = []

        for (let index = 1; index < 60; index++) {
            minute.push(index.toString())
        }
        for (let index = 1; index < 12; index++) {
            hour.push(index.toString())
        }
        for (let index = 1; index < 30; index++) {
            day.push(index.toString())
        }
        setDropdownTimes({ hour: hour, minute: minute, day: day })
    }

    const getDetail = async (id) => {
        var d = await GetWithToken("MarketPlace/GetDetailById/" + id).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        debugger
        setMarketPlaceDetail(d.data);

        setLoading(false);
    }
    const toggleStartStop = async (marketPlaceEndpointType) => {
        setButtonLoading(true);

        var d = await GetWithToken("MarketPlace/ToggleTriggerJob/" + selectedMarketPlace.id + "/" + marketPlaceEndpointType).then(x => { return x.data }).catch((e) => { AlertFunction("Servis Başlatılamadı", "Lütfen pazaryeri tarafından size verilen bilgilerin doğru olduğundan emin olunuz."); return false })
        setButtonLoading(false);
        getDetail(selectedMarketPlace.id)
    }

    const updateTime = async () => {
        var data = {
            time: jobScheduleTime,
            jobScheduleTimeType: jobScheduleTimeType,
            marketPlaceEndpointType: selectedMarketPlaceEndpoints.marketPlaceEndpointType,
            marketPlaceId: selectedMarketPlace.id
        }
        setJobScheduleTimeType("");
        setJobScheduleTime("")
        var d = await PostWithToken("MarketPlace/EditTime", data).then(x => { return x.data }).catch((e) => { AlertFunction("Başarısız işlem", "Bu işlmel için yetkiniz bulunmuyor"); return false })
        getDetail(selectedMarketPlace.id)
        // AlertFunction("Kayıt Yapıldı","Senkronizasyon yeniden başlatılıyor",)
        setLoading(false);
    }
    const showDetal = async (id) => {


        setModalDetail(true);
    }


    return (

        <>{
            loading && <PageLoading></PageLoading>
        }


            <Layout>
                <PageHeader title="Sanal Pazar Yönetimi" map={[
                    { url: "", name: "Sanal Pazar Analiz" },
                    { url: "sanal-pazar-analiz", name: "Sanal Pazar Analiz" }]}>

                </PageHeader>
                {
                    modalDetail && <div className='content'> <button onClick={() => { setModalDetail(false) }} className='m-3 btn btn-danger '><i className='fa fa-arrow-left'></i> Geri</button> <OrderDetail marketPlace={selectedMarketPlace} endpointType={selectedMarketPlaceEndpoints}></OrderDetail></div>
                }



                <Modal isOpen={modalTime}
                    toggle={toggleModalTime}
                    modalTransition={{ timeout: 100 }}>
                    <ModalHeader style={{ borderBottom: "1px solid #939393", paddingBottom: 10, background: "#e5e5e5" }}>
                        Senkronizasyon zaman ayarlaması
                    </ModalHeader>
                    <ModalBody>
                        <div className='row'>
                            <form className='col-12 row'>
                                <div className='col-6'>
                                    <label className='input-label'>Zaman Türü</label>
                                    <select type="hidden" id="jobScheduleTimeType" className="form-control" value={jobScheduleTimeType} onChange={(x) => { setJobScheduleTimeType(parseInt(x.target.value)); setJobScheduleTime("1") }} name="jobScheduleTimeType">
                                        <option value="0">Seçiniz</option>
                                        <option value="1">Dakika</option>
                                        <option value="2">Saat</option>
                                        <option value="3">Gün</option>
                                    </select>
                                </div>
                                <div className='col-6'>
                                    <label className='input-label'>Zaman </label>
                                    {/* <input value={jobScheduleTime} onChange={(x) => { jobScheduleTimeType === "3" && x.target.value <= 30 && setJobScheduleTime(x.target.value) || x.target.value <= 60 && setJobScheduleTime(x.target.value) }} type="number" max={jobScheduleTimeType === "3" && "30" || "60"} min="1" className=' form-control'></input> */}
                                    <select value={jobScheduleTime} onChange={(x) => setJobScheduleTime(x.target.value)} className='form-control'>
                                        {
                                            jobScheduleTimeType == "1" && dropdownTimes.minute.map((item, key) => { return <option key={key} value={item}>{item}</option> })
                                        }
                                        {
                                            jobScheduleTimeType == "2" && dropdownTimes.hour.map((item, key) => { return <option key={key} value={item}>{item}</option> })
                                        }
                                        {
                                            jobScheduleTimeType == "3" && dropdownTimes.day.map((item, key) => { return <option key={key} value={item}>{item}</option> })
                                        }
                                    </select>

                                </div>
                                <div className='col-12 br-dt'>

                                    <div className='pt-2'>
                                        &nbsp;
                                        {(jobScheduleTimeType != 0 && jobScheduleTime != "" && jobScheduleTime != null) &&
                                            <span className='tm-spn'>

                                                <i className='far fa-clock '></i> &nbsp;
                                                {jobScheduleTime + " " + (jobScheduleTimeType == "1" && "dakikada" || jobScheduleTimeType == "2" && "saate" || jobScheduleTimeType == "3" && "günde") + " bir kez günceller"}
                                            </span>
                                        }
                                    </div>
                                </div>
                                <div className='col-6'>
                                    &nbsp;
                                </div>
                                <div className='col-6'>
                                    <div className='row col-12 justify-content-between m-0 p-0'>
                                        <button onClick={() => { toggleModalTime(); updateTime(); }} disabled={jobScheduleTime == "" || !jobScheduleTimeType} type='button' className='btn btn-outline-success mt-2'><i className='fa fa-save'></i> Kaydet</button>
                                        <button onClick={() => { toggleModalTime() }} type='button' className='btn btn-outline-warning mt-2'><i className='fa fa-times-circle'></i> Kapat</button>

                                    </div>
                                </div>
                            </form>

                        </div>
                    </ModalBody>
                </Modal>
                {!modalDetail &&
                    <div className='content d-flex'>
                        <div className='sidebar sidebar-light sidebar-secondary sidebar-expand-md'>
                            <div className='sidebar-content'>
                                <div className='card'>
                                    <div className='card-header bg-transparent header-elements-inline row'>
                                        <div className='row'>
                                            <h2><b>Sanal Pazar</b></h2>
                                            Yönetmek istediğiniz sanal pazarı seçiniz
                                        </div>
                                    </div>
                                    <div className='card-body'>
                                        <ol className='rounded-list'>
                                            {marketPlaceList?.map((item, key) => {
                                                if (selectedMarketPlace?.id == item.id) {
                                                    return <li key={key} onClick={() => { setSelectedMarketPlace(item); getDetail(item.id) }} style={{ cursor: "pointer" }} className='act' ><a><i className='fas fa-arrow-right'></i><b> {item.description}</b><br></br>  {"> "}({item.marketPlaceKind})</a></li>
                                                } else {
                                                    return <li onClick={() => { setSelectedMarketPlace(item); getDetail(item.id) }} key={key} style={{ cursor: "pointer" }}><a> <b>{item.description}</b><br></br> ({item.marketPlaceKind})</a></li>
                                                }
                                            })}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='content-wrapper'>
                            <div className=' pl-4 pt-3'>
                                <div className='row p-0 m-0'>
                                    {marketPlaceDetail.marketPlaceEndpoints?.map((item, key) => {
                                        return (
                                            <div className='col-4' key={key}>
                                                <div className='schedule-panel'>
                                                    <div className="panel panel-body panel-body-accent p-2">
                                                        <div className="media no-margin">
                                                            <div className="media-left media-middle">
                                                                <i className={"fa-3x " + (item.marketPlaceEndpointType == 1 && "fas fa-sync-alt  text-blue-400 " || item.marketPlaceEndpointType == 5 && "fa fa-tags text-success-400" || item.marketPlaceEndpointType == 4 && "fas fa-calculator text-warning-400" || item.marketPlaceEndpointType == 2 && "fas fa-plus text-dark-400")}></i>
                                                            </div>
                                                            <div className="media-body text-right">
                                                                <h3 className="no-margin text-semibold">{item.marketPlaceEndpointTypeName}</h3>
                                                                {item.jobScheduleTime == null && <div className="text-size-mini  text-danger">Konfigure edilmedi !
                                                                    <button title="Başlat" style={{ lineHeight: 0, height: 25 }} onClick={() => { AlertFunction("Başlatma Yapılamaz", "Konfigurasyon ayarları yapılmadığından senkronizasyon başlatılamadı") }} className='btn btn-outline-danger btn-sm p-1 ml-2'><i className='fas fa-play'></i></button>
                                                                    <button onClick={() => { setSelectedMarketPlaceEndpoints(item); toggleModalTime(); setJobScheduleTimeType(item.jobScheduleTimeType); setJobScheduleTime(item.jobScheduleTime) }} title="Düzenle" style={{ lineHeight: 0, height: 25 }} className='btn btn-outline-danger btn-sm p-1 ml-2'><i className='fab fa-whmcs'></i></button></div>}

                                                                {item.jobScheduleTime != null && !item.isSyncronWorking && <div className="text-size-mini  text-success">Hazır!
                                                                    <button title="Başlat" style={{ lineHeight: 0, height: 25 }} onClick={() => { toggleStartStop(item.marketPlaceEndpointType) }} className='btn btn-outline-success btn-sm p-1 ml-2'>{buttonLoading && <i className='icon-spinner2 spinner'></i>}{!buttonLoading && <i className='fas fa-play'></i>}</button>
                                                                    <button onClick={() => { setSelectedMarketPlaceEndpoints(item); toggleModalTime(); setJobScheduleTimeType(item.jobScheduleTimeType); setJobScheduleTime(item.jobScheduleTime) }} title="Düzenle" style={{ lineHeight: 0, height: 25 }} className='btn btn-outline-success btn-sm p-1 ml-2'><i className='fab fa-whmcs'></i></button></div>}

                                                                {item.jobScheduleTime != null && item.isSyncronWorking && <div className="text-size-mini  text-success">Çalışıyor!
                                                                    <button title="Başlat" style={{ lineHeight: 0, height: 25 }} onClick={() => { toggleStartStop(item.marketPlaceEndpointType) }} className='btn btn-outline-warning btn-sm p-1 ml-2'>{buttonLoading && <i className='icon-spinner2 spinner'></i>} {!buttonLoading && <i className='fas fa-pause'></i>}</button>
                                                                    <button onClick={() => { setSelectedMarketPlaceEndpoints(item); toggleModalTime(); setJobScheduleTimeType(item.jobScheduleTimeType); setJobScheduleTime(item.jobScheduleTime) }} title="Düzenle" style={{ lineHeight: 0, height: 25 }} className='btn btn-outline-success btn-sm p-1 ml-2'><i className='fab fa-whmcs'></i></button></div>}
                                                            
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={"panel panel-body has-bg-image p-2 mb-4 " + (item.marketPlaceEndpointType == 1 && "bg-blue-400 " || item.marketPlaceEndpointType == 5 && "bg-success-400 " || item.marketPlaceEndpointType == 4 && "bg-warning-400 " || item.marketPlaceEndpointType == 2 &&  " bg-secondary")}>
                                                        <div className="media no-margin">
                                                            <div className="media-body">
                                                                <h3 className="no-margin"><button className='btn btn-sm bg-white' onClick={() => { setSelectedMarketPlaceEndpoints(item.marketPlaceEndpointType); showDetal(selectedMarketPlace.id) }}><i className='fa fa-search'></i>&nbsp;<b>İNCELE</b></button> </h3>
                                                                <span className="text-uppercase text-size-mini">total comments</span>
                                                            </div>
                                                            <div className="media-right media-middle bg-white" style={{ borderRadius: 5 }}>
                                                                {item.jobScheduleTime == null && <i title='Konfigurasyonu kontrol edin' className="fa fa-exclamation-triangle fa-3x opacity-75" style={{ color: "red", padding: 5 }}></i>}
                                                                {item.jobScheduleTime != null && <i title='Konfigurasyonu kontrol edin' className="fa fa-check-square fa-3x opacity-75" style={{ color: "green", padding: 5 }}></i>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                            </div>

                        </div>
                    </div>
                }
            </Layout>
        </>
    )

}