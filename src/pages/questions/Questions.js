import React, { useState, useEffect } from "react";
import useLocalStorage from '../../hooks/useLocalStorage';
import { Grid, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from "@material-ui/core";
import axios from "axios";
import config from '../../config';

// styles
import useStyles from "./styles";

// components
import PageTitle from "../../components/PageTitle/PageTitle";
import Widget from "../../components/Widget/Widget";
import { useUserState } from "../../context/UserContext";
import { Button } from '../../components/Wrappers';
import classnames from 'classnames';
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import NotificationsPage from "../notifications/Notifications";

export default function QuestionsPage() {
  const history = useHistory();
  const [page, setPage] = useLocalStorage('page',1);
  const { authId , authEmail} = useUserState();
  const [status, setStatus] = useState(false);
  const [currPage, setCurrPage] = useState(1);
  const [currLimit, setCurrLimit] = useState(10);
  const [nextPage, setNextPage] = useState('');
  const [nextLimit, setNextLimit] = useState('');
  const [limit, setLimit] = useState(5);
  const [allAns, setAllAns] = useState([]);
  const [allTempAns, setAllTempAns] = useState([]);
  const [studentAns, setStudentAns] = useState({
    "student_id": authId,
    "answer": allTempAns,
  });

  const handleChange = (event, index) => {
    const { name, value, checked } = event.target;
    setAllAns(prevState => ({
      ...prevState,
      [name]: parseInt(value)
    }));
    let markers = allTempAns;
    markers[index] = { ...allTempAns[index], "question_id": name, "answer_id": parseInt(value) };
    setAllTempAns(markers);
    markers = []
  };

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await axios(
       config.baseUrl + `eligibitycheck?id=${authId}`, {
       method: 'GET',
       headers: {},
       data: {},
       withCredentials: null
     })
       .then(response => {
         if(response.status === 201){
           setStatus(true);
         }else{
           setStatus(false);
         }
       }).catch(error => { history.push('/app/thanks')});
   }
   fetchData();
  }, []);

  useEffect(() => {
      async function fetchData() {
        const response = await axios(
          config.baseUrl + `questions?page=${page}&limit=${currLimit}`, {
          method: 'GET',
          headers: {},
          data: {},
          withCredentials: null
        })
          .then(response => {
            setQuestions(response.data.question.result);
            setNextPage(response.data.question?.next?.page || null);
            setNextLimit(response.data.question?.next?.limit || null);
          }).catch(error => { alert("Something went wrong !")});
      }
      fetchData();
  }, [page, currLimit]);

  async function handleClick() {
    if(nextPage){
      const response = await axios(
        config.baseUrl + 'useranswers', {
        method: 'POST',
        headers: {},
        data: studentAns,
        withCredentials: null
      })
        .then(response => {
          setStudentAns({
            "student_id": authId,
            "answer": [],
          });
          setAllAns([]);
          setAllTempAns([]);
          setCurrPage(page);
          setPage(nextPage);
          setCurrLimit(nextLimit);
        }).catch(error => {alert("Something went wrong !") });
    }else{
      const response = await axios(
        config.baseUrl + 'useranswers', {
        method: 'POST',
        headers: {},
        data: studentAns,
        withCredentials: null
      })
        .then(response => {
          answerCheck()
        }).catch(error => {alert("Something went wrong !") });
    }
  }

const answerCheck = async()=>{
  const studentAnswers = await axios(config.baseUrl + `getsubmitedanswers?id=${authId}`, {method: 'GET',withCredentials: null})
  const answerCall = await axios(config.baseUrl + 'getanswers', {method: 'GET',withCredentials: null})
  let arr1 = answerCall.data.answers[0].answer
  let arr2 = studentAnswers.data.result.answer
  let count = 0;
    arr1.filter(el => {
      return !arr2.find(element => {
        if(element?.question_id === el?.question_id && element?.answer_id === el?.answer_id){
          count +=1;
        }
      });
    });
    const response = await axios(
      config.baseUrl + 'score', {
      method: 'POST',
      headers: {},
      data: {
        email : authEmail,
        score : count,
      },
      withCredentials: null
    })
    history.push('/app/thanks')
    return count;
}


  return (
    <>
      <PageTitle title="Questions" />
      <Grid container spacing={4}>
        <Grid item xs={12} md={12}>
          <Widget title="" disableWidgetMenu>
            {questions.map((question, index) => {
              const ques_id = question?._id;
              // console.log(allAns);
              // console.log(allAns[ques_id]);
              // console.log(question?._id);
              return (
                <>
                  <Grid item xs={12} md={12}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">{question.content.serial_no}. {question.content.title}</FormLabel><br />
                      <RadioGroup aria-label="gender" name={question._id} value={allAns[ques_id] || ''} onChange={(e) => handleChange(e, index)}>
                        {question.content.options.map((option) => {
                          return (
                            <>
                              <FormControlLabel value={option.id} control={<Radio />} label={option.name} />
                            </>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                  </Grid><br />
                </>
              );
            })}
            {/* <button onClick={handleClick}>Next</button> */}
            <Button variant="contained" color={nextPage ? 'primary' : 'success'} onClick={handleClick}>{nextPage ? 'Next' : 'Submit'}</Button>
          </Widget>
        </Grid>
      </Grid>
    </>
  );
}
