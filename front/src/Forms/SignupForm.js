import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../Images/background.jpg'

const SignupForm = () => {
    useEffect(() => {
        nameInputRef.current.focus();
    }, []);
    const path = "http://127.0.0.1:5000";
    const [Data, setData] = useState({
        Name: "",
        Email: "",
        Password: "",
        showPassword: false,
        mobile: ""
    });
    // const [verified, setVerified] = useState(false);
    /* const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState(""); */
    const nameInputRef = useRef(null);
    const navigate = useNavigate();

    const signup = async (e) => {
        e.preventDefault();
        console.log(Data);
        const { Name, Email, Password } = Data;
        if (!Name || !Email || !Password) {
            alert("Please fill all the fields");
            return;
        }
        const response = await fetch(`${path}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Data)
        })
        const main_response = await response.json();
        if (main_response) {
            if (main_response.error) {
                alert(main_response.error);
                setData({
                    Name: "",
                    Email: "",
                    Password: ""
                })
                return;
            }
            console.log(main_response);
            navigate("/login");
        }
        else {
            alert("Something went wrong");
        }
    }
    /* 
        const sendOtp = async () => {
            console.log("+91"+mobile);
            try {
                if (!mobile || mobile.length < 10 || mobile.length > 13) {
                    alert("Please enter mobile number");
                    return;
                }
                const verified_message = await fetch(`${process.env.REACT_APP_HTTP}/send-otp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        phoneNumber: "+91"+mobile
                    })
                })
                if (verified_message.status === 200) {
                    setData({ ...Data, mobile: mobile })
                    setMobile("")
                    document.getElementById("otp").style.display = "block";
                }
    
            } catch (error) {
                console.log(error);
            }
        } */

    /* const verifyOtp = async (e) => {
        console.log(Data.mobile,otp);
        const verified_message = await fetch(`${process.env.REACT_APP_HTTP}/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                phoneNumber: "+91"+Data.mobile,
                otp: Number(otp)
            })
        })
        if (verified_message.status === 200) {
            alert("OTP verified successfully");
            setOtp("");
            document.getElementById("mobile_dashboard").style.display = "none";
            setVerified(true);
        }
        else{
            alert("OTP verification failed");
        }
    } */

    return (
        <>
            <div style={{ backgroundColor: "#eee", height: "100vh", backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover" }}>
                <div className='container-sm w-90 mx-auto'>
                    <section className="vh-100 gradient-custom">
                        <div className="container py-5 h-100">
                            <div className="row justify-content-center align-items-center h-100">
                                <div className="col-12 col-lg-9 col-xl-7">
                                    <div className="card shadow-2-strong card-registration" style={{ borderRadius: "15px" }}>
                                        <div className="card-body p-4 p-md-5">
                                            <h3 className="mb-4 pb-2 pb-md-0 mb-md-5">Registration Form</h3>
                                            <form>
                                                {/* <div id='mobile_dashboard'>
                                                    <div className="input-group mb-3">
                                                        <input type='text' name="phone" id="form2Example7" className="form-control" placeholder='Enter your phone number' value={mobile} onChange={(e) => setMobile(e.target.value)} />
                                                        <div className="input-group-append">
                                                            <button className="tn btn-primary btn" type="button" onClick={() => sendOtp()}>send otp</button>
                                                        </div>
                                                    </div>
                                                    <div id='otp' className="form-outline mb-4 mt-4" style={{ display: 'none' }}>
                                                        <input name='otp' type="text" id="form2Example8" className="form-control" placeholder='Enter otp' value={otp} onChange={(e) => setOtp(e.target.value)} />
                                                    </div>
                                                    <button type='button' className='btn btn-primary btn-block mb-4' onClick={(e) => verifyOtp(e)} >Verify</button>
                                                </div> 
                                                <hr />
                                                */}
                                                <div className="form-outline mb-4 mt-4">
                                                    <input name='name' type="text" id="form2Example1" className="form-control" placeholder='Enter your full name' value={Data.Name} onChange={(e) => setData({ ...Data, Name: e.target.value })} ref={nameInputRef} />
                                                </div>

                                                {/* <!-- Email input --> */}
                                                <div className="form-outline mb-4">
                                                    <input name='email' type="email" id="form2Example3" className="form-control" placeholder='Email address' value={Data.Email} onChange={(e) => setData({ ...Data, Email: e.target.value })} />
                                                </div>

                                                {/* <!-- Password input --> */}
                                                <div className="form-outline mb-4">
                                                    <div className="input-group mb-3">
                                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                                        <input className="form-control" type={Data.showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={Data.Password} onChange={(e) => setData({ ...Data, Password: e.target.value })} />
                                                        <span className="input-group-text justify-content-center" style={{ width: '40px', cursor: 'pointer' }}><i className={Data.showPassword ? 'far fa-eye' : 'far fa-eye-slash'} onClick={() => {
                                                            setData({ ...Data, showPassword: !Data.showPassword })
                                                        }
                                                        }></i></span>
                                                    </div>
                                                </div>

                                                {/* <!-- Submit button --> */}
                                                <button type="button" className="btn btn-primary btn-block mb-4" onClick={(e) => signup(e)} /* disabled={!verified} */>Sign Up</button>

                                                {/* <!-- Register buttons --> */}
                                                <div className="text-center">
                                                    <p>already a member? <Link to='/login'>Sign in</Link></p>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}

export default SignupForm
