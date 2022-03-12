import Head from 'next/head';
import React from 'react';

export default function PageHeader({title="",map=[{url:"",name:""}]}) {

    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <div className="page-header page-header-light">
                <div className="page-header-content header-elements-md-inline">
                    <div className="page-title d-flex">
                        <h4><i className="icon-arrow-left52 mr-2"></i> <span className="font-weight-semibold"></span> {title}</h4>
                        <a href="#" className="header-elements-toggle text-default d-md-none"><i className="icon-more"></i></a>
                    </div>

                    <div className="header-elements d-none">
                        <div className="d-flex justify-content-center">
                            <a href="#" className="btn btn-link btn-float text-default"><i className="icon-bars-alt text-primary"></i><span>İstatistik</span></a>
                            <a href="#" className="btn btn-link btn-float text-default"><i className="icon-calculator text-primary"></i> <span>Ürünler</span></a>
                            <a href="#" className="btn btn-link btn-float text-default"><i className="icon-calendar5 text-primary"></i> <span>Siparişler</span></a>
                        </div>
                    </div>
                </div>

                <div className="breadcrumb-line breadcrumb-line-light header-elements-md-inline">
                    <div className="d-flex">
                        <div className="breadcrumb">
                            <a href="/dashboard" className="breadcrumb-item"><i className="icon-home2 mr-2"></i> Dashboard</a>

                            {map?.map((item, key) => {
                                if (item.name=="") {
                                    return null
                                }
                                if (item.url == "") {
                                    return <span key={key} className="breadcrumb-item active">{item.name}</span>
                                } else {

                                    return <a key={key} href={item.url} className="breadcrumb-item"> {item.name}</a>


                                }

                            })}


                        </div>

                        <a href="#" className="header-elements-toggle text-default d-md-none"><i className="icon-more"></i></a>
                    </div>

                    <div className="header-elements d-none">

                    </div>
                </div>
            </div>
        </>
    )

}