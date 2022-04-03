import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { GetWithToken, PostWithToken } from '../pages/api/crud';
import AlertFunction from './alertfunction';


function SetUserOnLanoratory({ laboratory }) {
    useEffect(() => {
        start()
    }, [])
    const [users, setUsers] = useState([]);
    const [userOption, setUserOption] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);

    const start = async () => {
        debugger
        var laborat = await GetWithToken("Laboratory/GetUserByLaboratory/" + laboratory.id)
            .then(x => { return x.data }).catch(x => { return false })
        setUsers(laborat.data);

    }
    const setOrRemoveUserOnLaboratory = async (uId, action) => {
        var d = await PostWithToken("Laboratory/SetOrRemoveLaboratoryOnUser/",
            { laboratoryId: laboratory.id, userId: uId, action: action })
            .then(x => { return x.data }).catch(x => { return false })
        if (d.isError) {
            AlertFunction("Atama Yapılmadı", d.message);
            return null;
        }
        start();
    }

    const GetUserByLaboratoryUserName = async (val) => {

        if (val.length > 2) {
            var d = await PostWithToken("Laboratory/GetUserByLaboratoryUserName", {
                query: val
            })
                .then(x => { return x.data }).catch(x => { return false })

            let list = [];
            for (const item of d.data) {
                list.push({
                    label: item.firstName + " " + item.lastname, value: item.id
                })
            }
            console.log(list)
            setUserOption(list)
        }

    }

    return (
        <div className='row col-12'>
            <div className='col-12 tbls'>
                <div className='row justify-content-center mb-2'>
                    <div className='col-6'>
                        <Select options={userOption} noOptionsMessage={(x) => { x.inputValue = "Minimum 3 karakter girerek arayınız" }} onChange={(x) => { setSelectedUser(x.value) }} onInputChange={(x) => { GetUserByLaboratoryUserName(x) }}></Select>

                    </div>
                    <div className='col-4'>
                        <button onClick={() => { setOrRemoveUserOnLaboratory(selectedUser, 1) }} className='btn btn-success' ><i className='fas fa-user-plus'></i> Kullanıcı Ekle</button>
                    </div>
                </div>
                <div className='row col-12 mb-3 mt-3' style={{fontSize:14}}>
                   <b>{laboratory?.name+" "} </b>  <span>Adlı Laboratuvar`a Atanmış Kullanıcı Listesi.</span> 
                </div>
                {users.length==0&& <i><b style={{color:"red"}}>Tanımlanmış Kullanıcı Bulunmuyor</b></i>}
                {users.length>0&&
                
                
                <table className='table table-bordered'>
                    <thead>
                        <tr>
                            <th>Ad Soyad</th>
                            <th>Görev</th>
                            <th style={{ width: 80 }}>#</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((item, key) => {
                                return <tr key={key}>
                                    <td>
                                        {item.firstName + " " + item.lastname}
                                    </td>
                                    <td>
                                        {item.role.map((jitem, jkey) => {
                                            return <span key={jkey}>{jitem}</span>
                                        })}
                                    </td>
                                    <td>
                                        <button style={{ padding: "2px 5px 2px 5px", fontSize: 10 }} onClick={() => {
                                            setOrRemoveUserOnLaboratory(item.id, 0)
                                        }} className='btn btn-danger btn-sm' >
                                            <i className='fas fa-user-times'  style={{fontSize:11}}></i> Kaldır</button>
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

export default SetUserOnLanoratory;