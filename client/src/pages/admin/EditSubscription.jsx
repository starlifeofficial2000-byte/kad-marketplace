import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import "./EditSubscription.css";

function EditSubscription(){

    const { id } = useParams();

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [form,setForm]=useState({

        name:"",

        description:"",

        price:0,

        duration:30,

        maxProducts:10,

        maxImages:5,

        boostCredits:0,

        expressCredits:0,

        featuredCredits:0,

        aiImageChecker:false,

        aiDescriptionGenerator:false,

        aiPriceSuggestion:false,

        voiceCall:false,

        videoCall:false,

        verifiedStore:false,

        analytics:false,

        prioritySupport:false,

        priorityLevel:1,

        active:true

    });

    useEffect(()=>{

        loadPlan();

    },[]);

    const loadPlan=async()=>{

        try{
const response = await api.get(
    "/settings"
);

            setForm(res.data);

        }

        catch(error){

            console.log(error);

        }

    };

    const handleChange=(e)=>{

        const{

            name,

            value,

            type,

            checked

        }=e.target;

        setForm({

            ...form,

            [name]:

            type==="checkbox"

            ?

            checked

            :

            value

        });

    };

    const save=async()=>{

        try{

            await axios.put(

                `/api/subscription-plans/${id}`,

                form,

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            alert("Subscription updated.");

            navigate("/admin/subscriptions");

        }

        catch(error){

            console.log(error);

        }

    };

    return(

<div className="edit-subscription">

<h1>

Edit Subscription

</h1>

<div className="form-grid">

<input

name="name"

value={form.name}

onChange={handleChange}

placeholder="Plan Name"

/>

<input

name="price"

type="number"

value={form.price}

onChange={handleChange}

/>

<input

name="duration"

type="number"

value={form.duration}

onChange={handleChange}

/>

<input

name="maxProducts"

type="number"

value={form.maxProducts}

onChange={handleChange}

/>

<input

name="maxImages"

type="number"

value={form.maxImages}

onChange={handleChange}

/>

<input

name="boostCredits"

type="number"

value={form.boostCredits}

onChange={handleChange}

/>

<input

name="expressCredits"

type="number"

value={form.expressCredits}

onChange={handleChange}

/>

<input

name="featuredCredits"

type="number"

value={form.featuredCredits}

onChange={handleChange}

/>

<textarea

name="description"

value={form.description}

onChange={handleChange}

placeholder="Description"

/>

</div>

<h2>

Features

</h2>

<div className="checkbox-grid">

<label>

<input

type="checkbox"

name="aiImageChecker"

checked={form.aiImageChecker}

onChange={handleChange}

/>

AI Image Checker

</label>

<label>

<input

type="checkbox"

name="aiDescriptionGenerator"

checked={form.aiDescriptionGenerator}

onChange={handleChange}

/>

AI Description Generator

</label>

<label>

<input

type="checkbox"

name="aiPriceSuggestion"

checked={form.aiPriceSuggestion}

onChange={handleChange}

/>

AI Price Suggestion

</label>

<label>

<input

type="checkbox"

name="voiceCall"

checked={form.voiceCall}

onChange={handleChange}

/>

Voice Calls

</label>

<label>

<input

type="checkbox"

name="videoCall"

checked={form.videoCall}

onChange={handleChange}

/>

Video Calls

</label>

<label>

<input

type="checkbox"

name="verifiedStore"

checked={form.verifiedStore}

onChange={handleChange}

/>

Verified Store

</label>

<label>

<input

type="checkbox"

name="analytics"

checked={form.analytics}

onChange={handleChange}

/>

Analytics

</label>

<label>

<input

type="checkbox"

name="prioritySupport"

checked={form.prioritySupport}

onChange={handleChange}

/>

Priority Support

</label>

<label>

<input

type="checkbox"

name="active"

checked={form.active}

onChange={handleChange}

/>

Active Plan

</label>

</div>

<button

className="save-btn"

onClick={save}

>

Save Changes

</button>

</div>

);

}

export default EditSubscription;