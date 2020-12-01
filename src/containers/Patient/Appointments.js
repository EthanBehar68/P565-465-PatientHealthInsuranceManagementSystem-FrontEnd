import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import withToast from '../../utils/withToast';
import moment from 'moment';
import empty from 'is-empty';

import { TextField, Grid, MenuItem, Button, Divider, withWidth, InputAdornment, Select } from '@material-ui/core';

import Loading from '../../components/Graphics/Loading';
import ManageRow from '../../components/Patient/ManageRow';
import AppointmentDetail from './AppointmentDetail';

import { specializationOptions } from '../../utils/options';

import { getPatientAppointments } from '../../store/actions/patients';

class Appointments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      currentDate: new Date(),
      filter: !empty(this.props.match.params.filter) ? this.props.match.params.filter : "Scheduled",
      appointmentId: !empty(this.props.match.params.appointmentId) ? this.props.match.params.appointmentId : ""
    };
  }

  async componentDidMount() {
    await this.props.getPatientAppointments(this.props.user.id);
    this.setState({...this.state, loaded: true});
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.match.params != this.props.match.params) {
      this.setState({
        ...this.state,
        filter: this.props.match.params.filter,
        appointmentId: this.props.match.params.appointmentId
      });
    }
  }

  render() {
    const { maxWidth, small, xs, theme, dark, user, doctors } = this.props;
    const { loaded, search, doctorId, filter, currentDate, appointmentId } = this.state;

    const currentMinutes = (currentDate.getHours() * 60) + currentDate.getMinutes();

    const scheduled = this.props.appointments.filter(appt => (moment.utc(appt.appointmentdate).isAfter(moment().format('YYYY-MM-DD')) || (moment.utc(appt.appointmentdate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') && appt.starttime <= currentMinutes)));
    const past = this.props.appointments.filter(appt => (moment.utc(appt.appointmentdate).isBefore(moment().format('YYYY-MM-DD')) || (moment.utc(appt.appointmentdate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') && appt.starttime > currentMinutes)));

    const list = (filter === "Scheduled" ? scheduled : past).map(appt => 
      <ManageRow 
        key={appt.id}
        appointment={appt}
        theme={theme}
        small={small}
        filter={filter}
        xs={xs}
      />
    );

    const appointment = empty(this.props.appointments.filter(appt => appt.id == appointmentId)) ? {} : this.props.appointments.filter(appt => appt.id == appointmentId)[0];

    return (
      <Fragment>
        {!loaded && (<Loading />)}
        <Grid item container xs={12} direction="column" alignItems="center" style={{ backgroundColor: theme.background.main, minHeight: "calc(100vh - 4rem)" }}>
          <Grid xs={12} item container direction="column" alignItems="center" style={{ height: "100%", background: theme.primary.main }}>
            <Grid item container xs={12} style={{ width: maxWidth, padding: small ? "1rem" : "2rem 0 1rem" }}>
              <Grid item container xs={12} style={{ margin: "1rem 0 0.75rem" }}>
                <span style={{ fontSize: "2rem", color: 'white', fontWeight: 500 }}>{empty(appointment) ? "My Appointments" : `${moment.utc(appointment.appointmentdate).format('MM/DD/YY')} Appointment`}</span>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
          <Grid xs={12} item container direction="column" alignItems="center" style={{ height: "100%"}}>
            <Grid item container xs={12} direction="column" style={{ width: maxWidth, padding: small ? "1rem" : "2rem 0 1rem" }}>
              {empty(appointment) && (<Fragment>
                <div style={{display: "flex", width: "100%", overflow: "scroll"}}>
                  {['Scheduled', 'Past'].map(header => (
                    <Link to={`/patient/appointments/${header}`}>
                      <div style={{padding: "1rem 1.5rem 0 0", cursor: "pointer", display: "flex", flexDirection: "column"}}>
                        <div style={{display: "flex", alignItems: "center"}}>
                          <span style={{fontWeight: filter === header ? 500 : 300, color: filter === header ? theme.primary.main : "#000"}}>{header}</span>
                          <div style={{backgroundColor: filter === header ? theme.primary.main : "rgb(238, 238, 238)", display: "flex", alignItems: "center", justifyContent: "center", width: "1.2rem", height: "1.2rem", borderRadius: "0.6rem", marginLeft: "0.5rem"}}>
                            <span style={{color: filter === header ? "#fff" : "#000", lineHeight: "1.2rem", fontWeight: filter === header ? 500 : 300, fontSize: "0.7rem"}}>{header === "Scheduled" ? scheduled.length : past.length}</span>
                          </div>
                        </div>
                        <div style={{height: "0.25rem", marginTop: "0.5rem", backgroundColor: filter === header ? theme.primary.main : "#fff"}} />
                      </div>
                    </Link>
                  ))}
                </div>
                <Divider style={{marginBottom: "1rem", width: "100%"}}/>
                {loaded && (list)}
              </Fragment>)}
              {!empty(appointment) && (<AppointmentDetail 
                onClose={() => this.setState({...this.state, appointmentId: ''})}
                appointment={appointment} 
                theme={theme} 
                small={small} 
                xs={xs}
              />)}
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    )
  }
}

const mapStateToProps = state => ({
  dark: state.dark,
  user: state.user,
  appointments: state.appointments
});

export default connect(mapStateToProps, { getPatientAppointments })(withRouter(withToast(Appointments)));