import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { GetWithToken, PostWithToken } from '../pages/api/crud';


function SetOrRemoveExaminationResultValueType({ Examination }) {
    useEffect(() => {
        start()
    }, [])
    const [sampleExaminationResultTypes, setSampleExaminationReulstTypes] = useState([]);
    const [initialDeviceResultValueValues, setInitialDeviceResultValueValues] = useState({});


    const start = async () => {

        var laborat = await GetWithToken("SampleExamination/GetSampleExaminationResultValueType/" + Examination.id)
            .then(x => { return x.data }).catch(x => { return false })
        setSampleExaminationReulstTypes(laborat.data);

    }
    const deleteValue = async (id) => {

        var laborat = await GetWithToken("SampleExamination/DeleteSampleExaminationResultValueType/" + id)
            .then(x => { return x.data }).catch(x => { return false })
       start();

    }

    const submit = async (value) => {

        var laborat = await PostWithToken("SampleExamination/CreateSampleExaminationResultValueType", value)
            .then(x => { return x.data }).catch(x => { return false })
            start()
    }



    return (
        <div className='row col-12'>
            <div className='col-12 tbls'>
                <div className='row justify-content-center mb-2'>
                <div className='row col-12 mb-3' style={{ fontSize: 12 }}>
                    <b><i>Analiz sonuç değeri; analiz işlemi bittiğinde sonuçun hangi değerler alacağını tanımlama yapar. Analiz sürecinde bu verilerden yardım alınır   </i></b>

                </div>
                    <Formik
                        initialValues={initialDeviceResultValueValues}
                        validate={values => {
                            const errors = {};

                            return errors;
                        }}
                        onSubmit={(values, { setSubmitting }) => {
                            
                            values.sampleExaminationId = Examination.id
                            setTimeout(async () => {
                                await submit(values)
                                setSubmitting(false);
                            }, 400);
                        }}
                    >

                        {({ isSubmitting, isValidating, handleChange, handleBlur, setFieldValue, values }) => (
                            <Form className='row mt-3 col-12 form-n-popup' >
                                <>
                                    <ErrorMessage name="id" component="div" className='text-danger' />
                                    <Field type="hidden" name="id" />
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="measurementUnit" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Sonuç Değeri Birimi Kodu</label>
                                        <Field type="text" id="measurementUnit" className="form-control" name="measurementUnit" />
                                    </div>
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="measurementUnitLongName" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Sonuç Değeri Birimi Açılımı</label>
                                        <Field type="text" id="measurementUnitLongName" className="form-control" name="measurementUnitLongName" />
                                    </div>
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="measureUnitType" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Sonuç Değeri Birimi Değer Türü</label>
                                        <select name="measureUnitType" id="measureUnitType" onBlur={handleBlur} onChange={handleChange} className='form-control'>
                                            <option>
                                                Seçiniz
                                            </option>

                                            <option value={1}>
                                                Yüzde (%48)
                                            </option>
                                            <option value={2}>
                                                Ondalık Sayı Örn(5,1)
                                            </option>
                                            <option value={3}>
                                                Sayısal Karakter (254)
                                            </option>
                                            <option value={4}>
                                                Alfanumerik Karakter (0 RH+)
                                            </option>
                                        </select>
                                    </div>
                                    <div className='col-6 mb-3'>
                                        <ErrorMessage name="measureUnitSymbol" component="div" className='text-danger danger-alert-form' />
                                        <label className='input-label'>Sonuç Değeri Birimi Sembolü</label>
                                        <Field type="text" id="measureUnitSymbol" className="form-control" name="measureUnitSymbol" />
                                    </div>

                                    <div className='row col-12 mt-1'>
                                        <div className='col-3'>
                                            <button type='submit' disabled={isSubmitting} className={"btn btn-outline-success btn-block  btn-sm " + (isSubmitting && " loading-button")}><span>Ekle <i className="icon-circle-right2 ml-2"></i></span></button>
                                        </div>
                                    </div>
                                </>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div className='row col-12 mb-3 mt-3' style={{ fontSize: 18 }}>
                    <b>{Examination?.name + " "} </b>  <span>Adlı Analiz!in Sonuç Değerleri Listesi.</span>
                </div>
  
                {sampleExaminationResultTypes.length == 0 && <i><b style={{ color: "red" }}>Tanımlanmış Sonuç Değeri Bulunmuyor</b></i>}
                {sampleExaminationResultTypes.length > 0 &&


                    <table className='table table-bordered'>
                        <thead>
                            <tr>
                                <th>Sonuç Değeri Birimi Kodu</th>
                                <th>Sonuç Değeri Birimi Açılımı</th>
                                <th>Sonuç Değeri Birimi Değer Türü</th>
                                <th>Sonuç Değeri Birimi Sembolü</th>
                                <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                sampleExaminationResultTypes.map((item, key) => {
                                    return <tr key={key}>
                                        <td>
                                            {item.measurementUnit}
                                        </td>
                                        <td>
                                            {item.measurementUnitLongName}
                                        </td>
                                        <td>
                                            {item.measureUnitTypeName}
                                        </td>
                                        <td>
                                            {item.measureUnitSymbol}
                                        </td>
                                        <td>
                                            <button style={{ padding: "2px 5px 2px 5px", fontSize: 10 }} onClick={() => {
                                                deleteValue(item.id)
                                            }} className='btn btn-danger btn-sm' >
                                                <i className='fa fa-times-circle mr-1' style={{ fontSize: 11 }}></i> Kaldır</button>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>}
            </div>
        </div>
    );
}

export default SetOrRemoveExaminationResultValueType;