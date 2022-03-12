import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import AlertFunction from '../../../components/alertfunction';
import DataTable from '../../../components/datatable';
import { getMerchantFromStrorage } from '../../../components/localStorage';
import Modal from '../../../components/modal';
import Layout from '../../../layout/layout';
import PageHeader from '../../../layout/pageheader';
import PageLoading from '../../../layout/pageLoading';
import { GetWithToken, PostWithToken } from '../../api/crud';
import ReactTooltip from 'react-tooltip';
import ReactConfirmAlert, { confirmAlert } from 'react-confirm-alert';
import { ModalBody, Modal as ReactStrapModal, ModalHeader } from 'reactstrap';

export default function Index() {
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = React.useState(false);
    const [initialData, setInitialData] = React.useState({ antegraMerchantId: getMerchantFromStrorage()?.value });
    const [editInitialData, setEditInitialData] = React.useState({});
    const [pageRefresh, setPageRefresh] = React.useState();

    const [refreshDatatable, setRefreshDatatable] = React.useState();
    const [categoryList, setCategoryList] = useState([])
    const toggleModal = () => setModal(!modal);
    const [modalOpen, setModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isVariant, setIsVariant] = useState(false)
    const [valueList, setValueList] = useState([])

    const router = useRouter()
    useEffect(() => {
        start();

    }, [])


    const submit = async (val) => {
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get('myParam');
        debugger
        if (isVariant === "true") {
            if (valueList.length == 1) {
                AlertFunction("Hata", "en az 2 adet varyant eklenmeli")
                return false;
            }
            var dd = await PostWithToken("Product/CreateEdit", valueList).then((x) => { return x.data })
        } else {
            var vallist = [];

            if (!val.values.barcode) {
                val.values.barcode = "BRC-" + Math.floor((Math.random() * 99999999999)) + "FAL" + Math.floor((Math.random() * 300))
            }
            vallist.push(val.values)

            var dd = await PostWithToken("Product/CreateEdit", vallist).then((x) => { return x.data })
        }

        if (dd.error == true) {
            AlertFunction("Hata", "Ürün bulunamadı. Kayıt Esnasında sorun oluştu")
        } else {
            // router.push({ pathname: 'urun-listesi/urun-ekle/', query: { productId: dd.data.id } })
        }
    }
    const submitEdit = async (val) => {
        setIsSending(true)
        var dd = await PostWithToken("Product/CreateEdit", val.values).then((x) => { return x.data })
        setRefreshDatatable(new Date())
        setTimeout(() => {
            setIsSending(false)
        }, 1300);
    }



    const deleteFunc = async (data) => {

        await PostWithToken("Product/Delete/" + data.id).then((x) => { return x.data })
        setRefreshDatatable(new Date())
    }

    const start = async () => {
        var d = await GetWithToken("CategoryManager/GetAllCategories").then((x) => { return x.data })

        var catList = []
        for (const item of d.data) {
            catList.push({ id: item.id, text: item.name })
        }
        setCategoryList(catList)
    }

    const closeModal = () => {

        setModalOpen(false)
    }
    const closeEditModal = () => {

        setEditModalOpen(false)
    }
    return (
        <>
            {
                isSending &&
                <ReactConfirmAlert

                    title='Ürün gönderimi'
                    buttons={[
                        {
                            label: "Ürün gönderiliyor"
                        }
                    ]}><div>ürün gidiyor</div></ReactConfirmAlert>
            }
            {
                loading && <PageLoading></PageLoading>
            }



            {modalOpen &&
                <>

                    <Modal modalTitle={initialData == null ? "Ürün Ekle" : "Ürün Düzenle"} closeModal={closeModal} items={
                        [
                            {
                                props: {
                                    name: "id",
                                    type: "hidden",
                                },

                            },
                            {
                                props: {
                                    name: "isVariant",
                                    type: "select-bool",
                                    className: "form-control",
                                    label: "Varyant Durumu",
                                    required: "required",

                                },
                                effectedchange: (x) => { setIsVariant(x.target.value); },
                                data: [{ id: true, text: "Bu Ürün Varyantlı" }, { id: false, text: "Varyantsız (Tek)" }],
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "productName",
                                    type: "text",
                                    className: "form-control",
                                    label: "Ürün Adı",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "barcode",
                                    type: "text",
                                    className: "form-control",
                                    label: "Barkod",

                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "antegraCategoryId",
                                    type: "select",
                                    className: "form-control",
                                    label: "Kategori",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3",
                                data: categoryList
                            },
                            {
                                props: {
                                    name: "kDV",
                                    type: "select",
                                    className: "form-control",
                                    label: "KDV",
                                    required: "required"
                                },
                                data: [{ text: "0", id: 0 }, { text: "1", id: 1 }, { text: "8", id: 8 }, { text: "18", id: 18 }],
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "sKU",
                                    type: "text",
                                    className: "form-control",
                                    label: "StokKodu",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "quantity",
                                    type: "number",
                                    className: "form-control",
                                    label: "Stok Adeti",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "dimensionalWeight",
                                    type: "number",
                                    className: "form-control",
                                    label: "Desi",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "listPrice",
                                    type: "money",
                                    className: "form-control",
                                    label: "Liste Fiyatı",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            {
                                props: {
                                    name: "salePrice",
                                    type: "money",
                                    className: "form-control",
                                    label: "Satış Fiyatı",
                                    required: "required"
                                },
                                rowCssClass: "col-12 col-md-3 col-lg-3"
                            },
                            // {
                            //     props: {
                            //         name: "salePrice",
                            //         type: "button",
                            //         className: "form-control",
                            //         label: "Satış Fiyatı",
                            //         required: "required"
                            //     },
                            //     rowCssClass: "col-12 col-md-3 col-lg-3"
                            // },

                            {
                                props: {
                                    name: "description",
                                    type: "editor",
                                    className: "form-control",
                                    label: "Açıklma",
                                    required: "required",
                                    hiddenable: true
                                },
                            },
                        ]
                    }
                        initialValues={initialData == null ? {
                            id: null,

                        } : initialData}
                        closeWhenSumbit={false}
                        submit={submit}
                        child={
                            isVariant && valueList.length > 0 &&
                            <div className='mt-3 col-12 row ll-list-item'>
                                <b className='mb-2' style={{fontSize:20}}>Varyant Listesi</b>
                                <table className='table table-striped' style={{ width: "100%",background:"white" }}>
                                    <thead style={{ background: "#969696" }}>
                                        <tr>
                                            <th>Ürün Adı</th>
                                            <th>Barkod</th>
                                            <th>Stok Kodu</th>
                                            <th>Stok Adeti</th>
                                            <th>#</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            valueList.map((item, key) => {

                                                return <tr key={key}>
                                                    <td>{item.productName}</td>
                                                    <td>{item.barcode}</td>
                                                    <td>{item.sKU}</td>
                                                    <td>{item.quantity}</td>

                                                    <td><button onClick={
                                                        () => {
                                                            var llsit = valueList.filter(x => { return x != item });
                                                            setValueList(llsit)
                                                        }
                                                    } className='btn btn-danger btn-sm' type='button'><i className='fa fa-trash'></i> Sil</button> </td>

                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div >
                        }
                        extraButtons={isVariant === "true" && [{
                            text: <span><i className="fa fa-plus-circle"></i> Varyant Ekle</span>,
                            className: "btn btn-info p-2 mr-4",
                            onClick: (value) => {
                                var vall = valueList;
                                var errors = [];
                                !value.productName && errors.push("Ürün Adı");
                                !value.antegraCategoryId && errors.push("Kategori Adı");
                                !value.kDV && errors.push("Kdv");
                                !value.sKU && errors.push("Stok Kodu");
                                !value.dimensionalWeight && errors.push("Desi");
                                !value.listPrice && errors.push("Liste Fiyatı");
                                !value.salePrice && errors.push("Satış Fiyatı");
                                !value.description && errors.push("Açıklama");

                                if (errors.length > 0) {
                                    confirmAlert({
                                        title: "Ekleme yapılamaz",
                                        message: <div>Zorunlu Alanları Doldurunuz {errors.map((item, key) => { return <span style={{ color: "red", display: "block" }}>{item}</span> })}</div>,
                                        buttons: [
                                            {
                                                label: "Tamam",
                                                onClick: () => { }
                                            }
                                        ]
                                    })
                                    return false;
                                }
                                if (!value.barcode) {
                                    value.barcode = "BRC-" + Math.floor((Math.random() * 99999999999)) + "FAL" + Math.floor((Math.random() * 300))
                                }
                                vall.push(value); setValueList(vall); 
                                setPageRefresh(new Date())
                               var objDiv= document.getElementById("kc-modal");
                               objDiv.scrollTop=0;
                            }
                            ,
                        }] || []} >
                    </Modal>

                </>
            }


            {editModalOpen &&
                <Modal modalSize="small" modalTitle="Stok Ve Fiyat Güncelleme" closeModal={closeEditModal} items={
                    [
                        {
                            props: {
                                name: "id",
                                type: "hidden",
                            },

                        },

                        {
                            props: {
                                name: "productName",
                                type: "text",
                                disabled: "disabled",
                                className: "form-control",
                                label: "Ürün Adı",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "quantity",
                                type: "number",
                                className: "form-control",
                                label: "Stok Adeti",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "listPrice",
                                type: "money",
                                className: "form-control",
                                label: "Liste Fiyatı",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },
                        {
                            props: {
                                name: "salePrice",
                                type: "money",
                                className: "form-control",
                                label: "Satış Fiyatı",
                                required: "required"
                            },
                            rowCssClass: "col-12 col-md-6 col-lg-6"
                        },

                    ]
                }

                    initialValues={editInitialData == null ? {
                        id: null,
                    } : editInitialData}
                    submit={submitEdit}
                ></Modal>
            }

            <Layout>
                <PageHeader title="Ürün Listesi" map={[
                    { url: "", name: "Ürün Yönetimi" },
                    { url: "urun-listesi", name: "Ürün Listesi" }]}>
                </PageHeader>



                <div className='content'>

                    <DataTable Refresh={refreshDatatable} DataUrl={"Product/GetAllProduct/" + getMerchantFromStrorage()?.value} HideButtons Headers={[
                        ["categoryName", "Ürün"],
                        ["categoryName", "Kategori"],
                        ["listPrice", "Liste Fiyatı"],
                        ["salePrice", "Satış Fiyatı"],
                        ["quantity", "Stok Adeti"],
                        {
                            header: <><span style={{ cursor: 'pointer' }} data-for='tltip'>Düzenle &nbsp; </span></>,

                            dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-success' type='button' title='Stok Ve Fiyat Güncelleme' onClick={(x) => { setEditInitialData({ quantity: data.quantity, productName: data.productName, salePrice: data.salePrice, listPrice: data.listPrice, id: data.id }); setEditModalOpen(true); }}><i className='fas fa-edit'></i> Güncelle</button> }
                        },
                        {
                            header: <><span style={{ cursor: 'pointer' }} data-for='tltip'>Detay &nbsp; <i className='fa fa-info-circle'></i> </span><ReactTooltip backgroundColor='#c4ff4f' textColor='black' id='tltip'><span>Bu buton ürünün sanalpazarlardaki durumunu ve ürün hakkındaki detayların bulunduğu sayfaya yönlendirir</span></ReactTooltip></>,

                            dynamicButton: (data) => { return <button className='btn btn-sm btn-outline-info' title='Ürünün sanalpazarlardaki durumu' onClick={(x) => { router.push({ pathname: 'urun-listesi/urun-ekle/', query: { variantGroupId: data.variantGroupId } }) }}><i className='fas fa-search'></i> İncele</button> }
                        }


                    ]} Title={"Ürün Listesi"}
                        Description={"Ürün düzenleme ve ekleme işlemini burdan yapabilirsiniz"}
                        HeaderButton={{
                            text: "Ürün Ekle", action: () => {
                                //  router.push('urun-listesi/urun-ekle', undefined, { shallow: true })
                                setModalOpen(true)
                            }
                        }}
                        DeleteButton={deleteFunc}
                        Pagination={1}
                    ></DataTable>
                </div>
            </Layout>
        </>

    )

}