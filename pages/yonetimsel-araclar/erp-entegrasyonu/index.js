import React, { useState } from 'react';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';

export default function Index() {
    const [erpTab, setErpTab] = useState()

    return (

        <Layout permissionControl={false}>
            <PageHeader title="Yönetimsel Araçlar" map={[
                { url: "", name: "Yönetimsel Araçlar" },
                { url: "", name: "Erp Entegrasyonu" },
            ]}>
            </PageHeader>

            <div className='content'>
                <div className="row col-12">
                    <div className="card col-12">
                        <div className="card-header header-elements-inline">
                            <h6 className="card-title">Erp Entegrasyonunu Aşağıdaki Formu Doldurarak Tamamlayabilirsiniz.</h6>

                        </div>

                        <div className="card-body">
                            <ul className="nav nav-tabs">
                                <li className="nav-item"><a href='javascirpt:void(0)' onClick={() => { setErpTab("LogoTiger") }} className={"nav-link " + (erpTab === "LogoTiger" ? "active" : "")} data-toggle="tab"><b>Logo Tiger</b></a></li>
                                <li className="nav-item"><a href='javascirpt:void(0)' onClick={() => { setErpTab("Micro") }} className={"nav-link " + (erpTab === "Micro" ? "active" : "")} data-toggle="tab"><b>Micro</b></a></li>

                            </ul>

                            <div className="tab-content">
                                {
                                    erpTab === "LogoTiger" &&
                                    <div className="tab-pane fade active show" >
                                        <div className='row'>
                                            <div className='col-12'>
                                              
                                            </div>
                                        </div>
                                    </div>
                                }



                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </Layout>

    )

}