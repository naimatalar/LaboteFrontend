import React, { useEffect, useState } from 'react';
import { Col, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import AlertFunction from '../../../../components/alertfunction';
import Layout from '../../../../layout/layout';
import PageHeader from '../../../../layout/pageheader';
import { GetWithToken } from '../../../api/crud';
import classnames from 'classnames';
const isBrowser = typeof window === 'undefined'





function Index(props) {
    const [devicesWithdValueUnit, setDevicesWithValueType] = useState([])
    const [activeTab, setActiveTab] = useState("1")

    useEffect(() => {
        start();

    }, [])
    const toggleTab = async () => {
        setActiveTab(!activeTab)
    }

    const start = async () => {
        var ppp = ""
        if (!isBrowser) {
            var path = window.location.pathname.split("/")
            ppp = path[path.length - 1]
        }

        var d = await GetWithToken("Analysis/GetDeviceValueUnitByAnalisysCreateRecordId/" + ppp).then(x => { return x.data }).catch((e) => { AlertFunction("", e.response.data); return false })
        setDevicesWithValueType(d.data.list)
        setActiveTab(d.data.list[0].id)
        console.log(d.data)
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

                <div className='content'>
                    <div className='card mt-3'>
                        <div className='tabbed'>
                            <ul>
                                <li className='exclude-list' style={{ float: 'left', color: "#8a8a8a" }}>Uygulanacak Analiz <i className='ml-3 fa fa-arrow-circle-right'></i></li>
                                {
                                    devicesWithdValueUnit.map((item, key) => {
                                        return <li onClick={() => { setActiveTab(item.id); }} className={classnames({ active: activeTab === item.id })}> {item.sampleExaminationName}</li>

                                    })
                                }
                            </ul>
                        </div>



                        <TabContent activeTab={activeTab} className="tab-p-analisys">

                            {
                                devicesWithdValueUnit.map((item, key) => {
                                    return <TabPane tabId={item.id} key={key}>
                                        <Row>
                                            <Col sm="6">
                                                {
                                                    item.devices.map((jitem, jkey) => {
                                                        return <form className='row ' key={key}>

                                                            {
                                                                jitem.deviceResultValueType.map((kitem, kkey) => {
                                                                    if (kitem.measureUnitType == 1) {
                                                                        return <div className='col-6 mt-4' key={key}>
                                                                            <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                            <input className='device-value-input' max={100} type="number"></input>
                                                                        </div>
                                                                    }
                                                                    if (kitem.measureUnitType == 2) {
                                                                        return <div className='col-6 mt-4' key={key}>
                                                                            <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                            <input className='device-value-input' max={100} type="number" ></input>
                                                                        </div>
                                                                    }
                                                                    if (kitem.measureUnitType == 3) {
                                                                        return <div className='col-6 mt-4' key={key}>
                                                                            <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                            <input className='device-value-input' max={100} type="number" ></input>
                                                                        </div>
                                                                    }
                                                                    if (kitem.measureUnitType == 4) {
                                                                        return <div className='col-6 mt-4' key={key}>
                                                                            <label className='input-label'>{kitem.measurementUnit} ({kitem.measureUnitSymbol})</label>
                                                                            <input className='device-value-input' max={100} type="text" ></input>
                                                                        </div>
                                                                    }


                                                                })
                                                            }
                                                        </form>
                                                    })
                                                }
                                            </Col>
                                        </Row>
                                    </TabPane>
                                })}


                        </TabContent>

                    </div>

                </div>
            </Layout>
        </>)
}

export default Index;