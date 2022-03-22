import { Dropdown, DropdownItem, DropdownMenu, Modal, ModalBody, ModalHeader } from 'reactstrap';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { DropdownToggle } from 'reactstrap';
import { GetWithToken } from '../pages/api/crud';
import App from "../layout/assets/js/app"
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import PermissionCheck from '../components/permissioncheck';
import { addOrUpdateStorage, getLaboratoryFromStorage, storageMercahtKey } from '../components/localStorage';


function Layout({ children, permissionControl = true }) {
    const [dropdownEnvelope, setDropdownEnvelope] = useState(false)
    const toggleEnvelope = () => setDropdownEnvelope(!dropdownEnvelope)

    const [dropdownMerchant, setDropdownMerchant] = useState(false)
    const toggleMerchant = () => setDropdownMerchant(!dropdownMerchant)

    const [dropdownMaster, setDropdownMaster] = useState(false)
    const [userData, setUserData] = useState({})
    const [menuList, setMenuList] = useState()
    const [menu, setMenu] = useState("")
    const [loadJquery, setLoadJquery] = useState(false)
    const pagePath = useRouter().asPath.split("/")
    const toggleMaster = () => setDropdownMaster(!dropdownMaster)
    const [permission, setPermission] = useState(null)
    const [merhcnatListItems, setMerchantListItems] = useState([])
    const [updatePage, setUpdatePage] = useState()
    const [isPageOk, setIsPageOk] = useState(false)

    useEffect(() => {
        start()
    }, [])

    const start = async () => {


        if (permissionControl == false) {
            setPermission(false)
        } else {
            var permission = await PermissionCheck().then(x => { return x })
            setPermission(permission)
        }
        var data = await GetWithToken("Layout/GetLayoutData").then(x => { return x.data })


        setUserData(data.data)
        setMenuList(data.data.menuList)

        var merchantList = await GetWithToken("Laboratory/GetAllCurrentLaboratory").then(x => { return x.data })
        if (merchantList.data) {
            var mercahntDrop = merchantList.data?.map((x, y) => { return { value: x.id, label: x.name } })

            if (!mercahntDrop?.length > 0 && pagePath[pagePath.length - 1] != "laboratuvar-tanimlari") {
                Router.push({ pathname: "/sistem-tanimlama/laboratuvar-tanimlama" })
            }
            setMerchantListItems(mercahntDrop);

            var mercahntStroge = getLaboratoryFromStorage()

            if (mercahntDrop?.filter(x => { return x.value == mercahntStroge?.value }).length == 0) {
                addOrUpdateStorage(storageMercahtKey, JSON.stringify(mercahntDrop[0]))
            }

        }


        var html = data.data.menuList?.map((item, key) => {

            // nav-item-expanded nav-item-open
            if (item.parentId == null && item.isMainPage) {
                return (<li key={key} className={"nav-item nav-item-submenu " + (pagePath.includes(item.pageUrl) && "nav-item-expanded nav-item-open")}>
                    <a href="#" className="nav-link"><i className={item.iconName}></i> <span>{item.pageName}</span></a>

                    <ul className="nav nav-group-sub" data-submenu-title="Layouts">
                        {data.data.menuList?.filter((x) => { return x.parentId == item.id })?.map((jitem, jkey) => {
                            return <li className="nav-item" key={jkey}>
                                <Link href={"/" + item.pageUrl + "/" + jitem.pageUrl}>
                                    <a className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}> {(pagePath.includes(jitem.pageUrl) && <i className='fa fa-arrow-right mr-1'></i>)} {jitem.pageName}</a>
                                </Link>
                            </li>

                        })
                        }
                    </ul>
                </li>)
            }
            if (item.parentId == null && item.isMainPage == false) {
                return (
                    <li className="nav-item" key={key}>
                        <a href={"/" + item.pageUrl} className="nav-link">
                            <i className={item.iconName}></i>
                            <span>{item.pageName}
                                {item.pageUrl == "dashboard" && <span className="d-block font-weight-normal opacity-50"></span>}
                            </span>
                            {/* <span className="badge bg-blue-400 align-self-center ml-auto">2.2</span> */}
                        </a>
                    </li>)
            }
        }
        )

        setMenu(html)
        setTimeout(() => {
            if (loadJquery == false) {
                App.initBeforeLoad();
                App.initCore();
                setLoadJquery(true)
            }
        }, 100);

        setIsPageOk(true)

    }
    if (permission == null) {
        return <></>
    }
    if (!isPageOk) {
        return <></>
    }
    return (

        <>

            <div className="navbar navbar-expand-md navbar-dark">
                <div className="navbar-brand">
                    <a href="index.html" className="d-inline-block">

                        <Image width={150} objectFit='contain' layout='fixed' src={require("../layout/global_assets/images/logo_light.png")} ></Image>
                    </a>
                </div>

                <div className="d-md-none">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar-mobile">
                        <i className="icon-tree5"></i>
                    </button>
                    <button className="navbar-toggler sidebar-mobile-main-toggle" type="button">
                        <i className="icon-paragraph-justify3"></i>
                    </button>
                </div>

                <div className="collapse navbar-collapse" id="navbar-mobile">
                    <ul className="navbar-nav">

                    </ul>

                    <span className="badge ml-md-3 mr-md-auto">&nbsp;</span>


                    <Dropdown isOpen={dropdownMerchant} className='mr-2' toggle={toggleMerchant}>
                        <DropdownToggle className='merchant-toggle-button'>
                            <i className="fas fa-store"></i>
                            {
                                getLaboratoryFromStorage()?.label && <span className=" ml-2">{getLaboratoryFromStorage()?.label}</span>
                            }
                            {
                                !getLaboratoryFromStorage()?.label && <span className=" ml-2">Laboratuvar Seçiniz</span>
                            }

                        </DropdownToggle>
                        <DropdownMenu className='drp-list' style={{
                            width: "230px",

                        }}>
                            <div className="dropdown-content-body dropdown-scrollable">
                                <ul className="media-list">
                                    {merhcnatListItems?.length > 0 &&
                                        <>
                                            {merhcnatListItems?.map((item, key) => {
                                                return <li key={key} className="mb-2 row">
                                                    <button className='btn col-12' onClick={() => {

                                                        addOrUpdateStorage(storageMercahtKey, JSON.stringify({ value: item.value, label: item.label }))
                                                        Router.reload(window.location.pathname);
                                                        setUpdatePage(new Date())
                                                        toggleMerchant()
                                                    }}>{item.label}</button>
                                                </li>
                                            })
                                            }
                                        </>
                                    }
                                    <>
                                        {!merhcnatListItems?.length > 0 &&


                                            <li className="mb-2 row justify-content-center">
                                                <b >Tanımlı Laboratuvar Bunlunamadı</b>
                                                <b className='mb-2' style={{ color: "red", textAlign: "center",fontSize: 11 }}><i className='fa fa-exclamation-triangle'></i> Laboratuvar tanımlama gerekli <i className='fa fa-exclamation-triangle'></i> </b>

                                                <i className='text-center mb-2'>** Eğer laboratuvar tanımlama yetkiniz yok ise lütfen yöneticinizle görüşün</i>
                                                <Link href={"/yonetimsel-araclar/laboratuvar-tanimlari"} >
                                                    {/* <a className={"nav-link " + (pagePath.includes(jitem.pageUrl) && "active")}>{jitem.pageName}</a> */}
                                                    <a className={"btn btn-warning col-12"}>Laboratuvar Tanımla</a>

                                                </Link>

                                            </li>
                                        }
                                    </>


                                </ul>
                            </div>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={dropdownEnvelope} className='mr-2' toggle={toggleEnvelope}>
                        <DropdownToggle >
                            <i className="icon-envelope"></i>
                            <span className="d-md-none ml-2">Messages</span>
                            <span className="badge badge-pill bg-warning-400 ml-auto ml-md-0" style={{ top: -8 }}>2</span>
                        </DropdownToggle>
                        <DropdownMenu>
                            <div className="dropdown-content-body dropdown-scrollable">
                                <ul className="media-list">
                                    <li className="media">
                                        <div className="mr-3 position-relative">
                                            <img src="../layout/global_assets/images/placeholders/placeholder.jpg" width="36" height="36" className="rounded-circle" alt=""></img>
                                        </div>

                                        <div className="media-body">
                                            <div className="media-title">
                                                <a href="#">
                                                    <span className="font-weight-semibold">James Alexander</span>
                                                    <span className="text-muted float-right font-size-sm">04:58</span>
                                                </a>
                                            </div>

                                            <span className="text-muted">who knows, maybe that would be the best thing for me...</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </DropdownMenu>
                    </Dropdown>

                    <Dropdown isOpen={dropdownMaster} toggle={toggleMaster}>
                        <DropdownToggle caret className='d-flex align-items-center'>
                            {/* <Image height={34} width={34} objectFit='contain' src={require("../layout/global_assets/images/placeholders/placeholder.jpg")} className="rounded-circle mr-2" height="34" alt=""></Image> */}
                            <span>{userData?.firstName}</span>
                        </DropdownToggle>
                        <DropdownMenu>
                            <div>  <a href="#" className="dropdown-item"><i className="icon-user-plus"></i> Ayarlar</a></div>
                            <div><a href="#" className="dropdown-item"><i className="icon-cog5"></i> Kullanıcılar</a></div>

                            <div><a href="#" onClick={() => { localStorage.removeItem("usrtknbalotetknenter"); location.reload(); }} className="dropdown-item"><i className="icon-switch2"></i> Çıkış</a></div>
                        </DropdownMenu>
                    </Dropdown>


                    {/* <li className="nav-item dropdown dropdown-user">
                            <a href="#" className="navbar-nav-link d-flex align-items-center dropdown-toggle" data-toggle="dropdown">
                                <img src="../layout/global_assets/images/placeholders/placeholder.jpg" className="rounded-circle mr-2" height="34" alt=""></img>
                                <span>Victoria</span>
                            </a>

                            <div className="dropdown-menu dropdown-menu-right">
                                <a href="#" className="dropdown-item"><i className="icon-user-plus"></i> My profile</a>
                                <a href="#" className="dropdown-item"><i className="icon-coins"></i> My balance</a>
                                <a href="#" className="dropdown-item"><i className="icon-comment-discussion"></i> Messages <span className="badge badge-pill bg-blue ml-auto">58</span></a>
                                <div className="dropdown-divider"></div>
                                <a href="#" className="dropdown-item"><i className="icon-cog5"></i> Account settings</a>
                                <a href="#" className="dropdown-item"><i className="icon-switch2"></i> Logout</a>
                            </div>
                        </li> */}

                </div>
            </div>




            <div className="page-content">


                <div className="sidebar sidebar-dark sidebar-main sidebar-expand-md">


                    <div className="sidebar-mobile-toggler text-center">
                        <a href="#" className="sidebar-mobile-main-toggle">
                            <i className="icon-arrow-left8"></i>
                        </a>
                        Navigation
                        <a href="#" className="sidebar-mobile-expand">
                            <i className="icon-screen-full"></i>
                            <i className="icon-screen-normal"></i>
                        </a>
                    </div>



                    <div className="sidebar-content">
                        <div className="sidebar-user">
                            <div className="card-body">
                                <div className="media">
                                    <div className="mr-3">
                                        <a href="#">
                                            <Image src={require("../layout/global_assets/images/placeholders/placeholder.jpg")} width="38" height="38" className="rounded-circle" alt=""></Image></a>
                                    </div>

                                    <div className="media-body">
                                        <div className="media-title font-weight-semibold">{userData?.firstName + " " + userData?.lastname} </div>
                                        <div className="font-size-xs opacity-50">
                                            <i className="icon-envelope font-size-sm"></i> {userData.email}
                                        </div>
                                    </div>

                                    <div className="ml-3 align-self-center">
                                        <a href="#" className="text-white"><i className="icon-cog3"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card card-sidebar-mobile">
                            <ul className="nav nav-sidebar" data-nav-type="accordion">


                                <li className="nav-item-header"><div className="text-uppercase font-size-xs line-height-xs">Main</div> <i className="icon-menu" title="Main"></i></li>

                                {menu}


                            </ul>
                        </div>


                    </div>


                </div>


                <div className='content-wrapper'>


                    {!permission && children}

                    {permission && <div className='content'>
                        <div className='row mt-5'>
                            <div className='row col-12 justify-content-center '>
                                <Image width={170} height={170} src={require("../layout/assets/images/notallow.png")}></Image>
                            </div>

                            <div className='col-12 row justify-content-center'>
                                <h1 className='text-center mt-3 text-danger '><b style={{ fontSize: 35 }}>Yetki Kısıtlı</b></h1>
                            </div>
                            <div className='col-12 row justify-content-center'>
                                <p className='text-center mt-3 text-danger ' style={{ fontSize: 20 }}>Bu sayfaya giriş yetkiniz bulunmamaktadır.</p>
                            </div>
                        </div>
                    </div>}








                    <div className="navbar navbar-expand-lg navbar-light">
                        <div className="text-center d-lg-none w-100">
                            <button type="button" className="navbar-toggler dropdown-toggle" data-toggle="collapse" data-target="#navbar-footer">
                                <i className="icon-unfold mr-2"></i>
                                Footer
                            </button>
                        </div>

                        <div className="navbar-collapse collapse" id="navbar-footer">
                            <span className="navbar-text">
                                &copy; 2015 - 2018. <a href="#">Limitless Web App Kit</a> by <a href="http://themeforest.net/user/Kopyov" target="_blank">Eugene Kopyov</a>
                            </span>

                            <ul className="navbar-nav ml-lg-auto">
                                <li className="nav-item"><a href="https://kopyov.ticksy.com/" className="navbar-nav-link" target="_blank"><i className="icon-lifebuoy mr-2"></i> Support</a></li>
                                <li className="nav-item"><a href="http://demo.interface.club/limitless/docs/" className="navbar-nav-link" target="_blank"><i className="icon-file-text2 mr-2"></i> Docs</a></li>
                                <li className="nav-item"><a href="https://themeforest.net/item/limitless-responsive-web-application-kit/13080328?ref=kopyov" className="navbar-nav-link font-weight-semibold"><span className="text-pink-400"><i className="icon-cart2 mr-2"></i> Purchase</span></a></li>
                            </ul>
                        </div>
                    </div>


                </div>
            </div>


        </>



    )

}
export default Layout