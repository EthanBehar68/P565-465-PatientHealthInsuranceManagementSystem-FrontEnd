import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import withToast from '../../utils/withToast';
import { connect } from "react-redux";
import moment from 'moment';
import empty from 'is-empty';

import { Grid, Divider, Button, TextField } from '@material-ui/core';
import { Menu, NavigateNext, NavigateBefore, CheckCircle } from '@material-ui/icons';

import Loading from '../Graphics/Loading';
import Message from '../Graphics/Message';

import {add_message, user_typing, state_update_conversation} from '../../store/actions/conversations';

class Chat extends Component {
	constructor(props) {
		super(props);
		this.timeout = 0;
		this.timeout2 = 0;
		this.state = {
			loaded: false,
			chat: {
				id: this.props.user.id,
				usertype: this.props.user.usertype,
				room_id: `${this.props.appointment.id}appt`,
				message: ''
			},
			userTyping: false,
			timerId: ''
		}
	}

	async componentDidMount() {
		this.setState({ ...this.state, loaded: true });
		this.messagesEnd.scrollTop = this.messagesEnd.offsetHeight;
	}

	componentDidUpdate(prevProps, prevState) {
		if(prevProps.conversations !== this.props.conversations) {
			this.messagesEnd.scrollTop = this.messagesEnd.offsetHeight;
		}
		if((this.props.conversations.filter(convo => convo.room_id === `${this.props.appointment.id}appt`)[0]?.userTyping !== prevProps.conversations.filter(convo => convo.room_id === `${this.props.appointment.id}appt`)[0]?.userTyping)) {
			setTimeout(() => { this.setState({...this.state, userTyping: this.props.conversations.filter(convo => convo.room_id === `${this.props.appointment.id}appt`)[0]?.userTyping}); this.messagesEnd.scrollTop = this.messagesEnd.offsetHeight;} , 300);
		}
	}

	handleChatChange = e => {
		e.preventDefault();
		if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.props.user_typing({room_id: this.state.chat.room_id, userTyping: true});
    }, 200);
    if(this.timeout2) clearTimeout(this.timeout2);
    this.timeout2 = setTimeout(() => {
      this.props.user_typing({room_id: this.state.chat.room_id, userTyping: false});
    }, 5000);
    this.setState({
      ...this.state,
      chat: {
        ...this.state.chat,
       	message: e.target.value
      }
    })
  }

  sendChat = () => {
  	this.props.add_message(this.state.chat);
  	this.setState({...this.state, chat: {...this.state.chat, message: ""}});
  }

	render() {
		const { maxWidth, small, xs, theme, appointment, user } = this.props;
		const { loaded, chat, userTyping } = this.state;

		const conversation = this.props.conversations.filter(convo => convo.room_id === `${appointment.id}appt`)[0];

		return (
			<Fragment>
				{!loaded && (<Loading />)}
				<Grid xs={12} container item>
					<Grid xs={12} container item justify="space-between">
						<span style={{ fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem" }}>Chat</span>
						<Divider style={{width: "100%", marginBottom: "0.75rem"}}/>
					</Grid>
					<Grid xs={12} container direction="column" item style={{border: `1px solid ${theme.primary.main}`, borderRadius: 3, height: "30rem", maxHeight: "70vh", overflowY: 'scroll', padding: "0 0.5rem", position: "relative", paddingBottom: "calc(40px + 1rem)"}}>

						<div style={{height: "100%", overflowY: "scroll"}} ref={(el) => { this.messagesEnd = el; }}>
							{!empty(conversation) && (conversation.messages.map((message, i) => (
								<Message 
									key={i}
									message={message}
									prevMessage={i !== 0 ? conversation.messages[i - 1] : ''}
									theme={theme}
									userMessage={message.user_id === user.id}
									lastMessage={conversation.messages.length - 1 === i}
								/>
							)))}
							{userTyping && (<div style={{display: 'flex', alignItems: "center", width: "100%", marginTop: "0.15rem", marginBottom: "1rem"}}>
								<div style={{backgroundColor: 'rgb(238, 238, 238)', display: "flex", alignItems: "center", justifyContent: "center", padding: "0.1rem 0.9rem", borderRadius: 1000}}>
									<span style={{fontSize: "2rem", linHeight: "2rem", color: "#aaaaaa", paddingBottom: "0.15rem"}}>•••</span>
								</div>
							</div>)}
						</div>

						<div style={{position: "absolute", bottom: 0, left: 0, width: "100%", padding: "0.5rem", backgroundColor: "rgb(238, 238, 238)"}}>
							<div style={{position: "relative", width: "calc(100% - 1rem)"}}>
								<TextField
	                size="small"
	                variant="outlined"
	                value={chat.message}
	                name="message"
	                multiline
	                onChange={this.handleChatChange}
	                color="primary"
	                inputProps={{
	                  placeholder: "Message...",
	                  maxLength: "1000"
	                }}
	                InputProps={{
	                	style: {
	                		paddingRight: "2.5rem"
	                	}
	                }}
	                style={{width: "100%", backgroundColor: "white"}}
	              />
	              <div style={{position: "absolute", right: 0, top: 0, display: "flex", justifyContent: "flex-end", alignItems: "flex-end", height: "100%", paddingRight: "0.3rem"}}>
	              	<div style={{borderRadius: "50%", display: "flex", paddingBottom: "0.3rem"}}>
	              		<CheckCircle onClick={empty(chat.message) ? () => {} : this.sendChat} style={{width: "1.8rem", height: '1.8rem', color: empty(chat.message) ? "#dddddd" : theme.secondary.main, cursor: empty(chat.message) ? "" : "pointer"}}/>
	              	</div>
	              </div>
              </div>
						</div>
					</Grid>
				</Grid>
			</Fragment>
		);
	}
}

const mapStateToProps = state => ({
  user: state.user,
  conversations: state.conversations
});

export default connect(mapStateToProps, { add_message, user_typing, state_update_conversation })(withRouter(withToast(Chat)));
