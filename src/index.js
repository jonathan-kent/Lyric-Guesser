import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {PieChart} from 'reaviz';
import {PieArcSeries} from 'reaviz';
import {PieArc} from 'reaviz';
import {PieArcLabel} from 'reaviz';
import {VennDiagram} from 'reaviz';
import {VennSeries} from 'reaviz';
import {VennArc} from 'reaviz';
import {VennLabel} from 'reaviz';

const VOTE_URL = window.location.hostname === "localhost" ? "http://localhost:5000/votes" : "https://lyric-guesser-api.vercel.app/votes";
const COMP_URL = window.location.hostname === "localhost" ? "http://localhost:5000/comps" : "https://lyric-guesser-api.vercel.app/comps";

class Question extends React.Component {
  render() {
    return (
      <div className="question">
        <a className="lyric" id="left-lyric" onClick={(event) => this.props.onClick(event, this.props.word1)}>
          {this.props.word1}
        </a>
        <div className="or">OR</div>
        <a className="lyric" id="right-lyric" onClick={(event) => this.props.onClick(event, this.props.word2)}>
          {this.props.word2}
        </a>
      </div>
    );
  }
}

class Result extends React.Component {
  timesMore() {
    if (this.props.lyricsData[0]['data'] == this.props.lyricsData[1]['data']) {
      return this.props.lyricsData[0]['key'] + " and " + this.props.lyricsData[1]['key'] + " are included in the same number of songs.";
    }
    var mostSongs = (this.props.lyricsData[0]['data'] > this.props.lyricsData[1]['data']) ? 0 : 1;
    const times = ((this.props.lyricsData[mostSongs]['data'] + this.props.lyricsData[2]['data']) / (this.props.lyricsData[1-mostSongs]['data'] + this.props.lyricsData[2]['data'])).toFixed(2);
    return times + "X more songs include " + this.props.lyricsData[mostSongs]['key'] + " than " + this.props.lyricsData[1-mostSongs]['key'];
  }

  render() {
    if (!this.props.voted) {
      return (
        <div className="blur-result">
          <div className="venn">
            <VennDiagram disabled={true} data={this.props.lyricsData} series={
              <VennSeries
                colorScheme={(data, index) => {
                  if (index % 3 == 0) return '#d89eb3'; // left circle
                  if (index % 3 == 1) return '#a15f85'; // right circle
                  else return '#b77898'; // intersect
                }}
                label={<VennLabel fontFamily="Montserrat, sans-serif" />}
              />
            }/>
          </div>
            {this.timesMore()}
          <div className="guess-title">
            What people guessed
          </div>
          <div className="pie">
            <PieChart disabled={true} data={this.props.voteData} series={
              <PieArcSeries
                arc={<PieArc disabled={true}/>}
                colorScheme={(data, index) => {
                  if (index % 2 == 0) return '#d89eb3';
                  else return '#a15f85';
                }}
                label={<PieArcLabel fontFamily="Montserrat, sans-serif" />}
              />}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="result">
        <div className="venn">
          <VennDiagram data={this.props.lyricsData} series={
            <VennSeries
              colorScheme={(data, index) => {
                if (index % 3 == 0) return '#d89eb3' // left circle
                if (index % 3 == 1) return '#a15f85' // right circle
                else return '#b77898' // intersect
              }}
              label={<VennLabel fontFamily="Montserrat, sans-serif" />}
              arc={
                <VennArc
                  onClick={(arc) => this.props.onClick(arc)}
                />
              }
            />
          }/>
        </div>
          {this.timesMore()}
        <div className="guess-title">
          What people guessed
        </div>
        <div className="pie">
          <PieChart data={this.props.voteData} series={
            <PieArcSeries
              colorScheme={(data, index) => {
                if (index % 2 == 0) return '#d89eb3';
                else return '#a15f85';
              }}
              label={<PieArcLabel fontFamily="Montserrat, sans-serif" />}
            />}
          />
        </div>
      </div>
    );
  }
}

class SongsPopup extends React.Component {
  render() {
    if(!this.props.songsPopupActive) return null;
    const renderData = this.props.songsPopupActive.map(function(data, index) {
      return <tr key={index}><td>{data.title}</td><td>{data.artist}</td></tr>;
    });
    return(
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => this.props.onClick()}>&times;</span>
          <table id="song-info">
            <tbody>
              <tr>
                <th>Title</th>
                <th>Artist</th>
              </tr>
              {renderData}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

class NextQuestions extends React.Component {
  render() {
    return(
      <div className="next-questions">
        <a className="next-question" onClick={() => this.props.onRandomClick()}>
          Try another random pair of lyrics
        </a>
        <a className="next-question" onClick={() => this.props.onCustomClick()}>
          Try a custom pair of lyrics
        </a>
      </div>
    );
  }
}

class CustomPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word1: null,
      word2: null,
      public: false,
    };

    this.handleW1Change = this.handleW1Change.bind(this);
    this.handleW2Change = this.handleW2Change.bind(this);
    this.handlePublicChange = this.handlePublicChange.bind(this);
  }

  handleW1Change(event) {
    this.setState( (state, props) => {
      return {
        word1: event.target.value,
      };
    });
  }

  handleW2Change(event) {
    this.setState( (state, props) => {
      return {
        word2: event.target.value,
      }
    });
  }

  handlePublicChange(event) {
    this.setState( (state, props) => {
      return {
        public: event.target.checked,
      }
    });
  }

  render() {
    if(!this.props.customPopupActive) return null;
    var publicMessage = "";
    if (this.state.public) publicMessage = "Public comparisons can be seen by other users! (Comparisons with profanity will not be public)";
    return(
      <div className="modal">
        <div className="modal-content" id="custom-form">
          <span className="close" onClick={() => this.props.onClose()}>&times;</span>
          <form onSubmit={(event) => this.props.onSubmit(event, this.state)}>
            <label>Enter your first word:
              <input type="text" placeholder="Mountain..." onChange={this.handleW1Change}/>
            </label>
            <label>Enter your second word:
              <input type="text" placeholder="River..." onChange={this.handleW2Change}/>
            </label>
            <label>
              Public
              <input type="checkbox" checked={this.state.public} onChange={this.handlePublicChange}/>
            </label>
            <div>
              {publicMessage}
            </div>
            <input type="submit" value="SUBMIT"/>
          </form>
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      voteData: [
        {key: 'word1', data: 1},
        {key: 'word2', data: 1}
      ],
      lyricsData: [
        {key: ['word1'], data: 1},
        {key: ['word2'], data: 1},
        {key: ['word1', 'word2'], data: 1}
      ],
      w1Songs: [],
      w2Songs: [],
      unionSongs: [],
      voted: false,
      songsPopupActive: null,
      customPopupActive: false,
      public: true,
      noResult: false,
    };
  }

  componentDidMount() {
    this.handleRandomClick();
  }

  alphabetizeWords() {
    var l = [this.state.voteData[0]["key"], this.state.voteData[1]["key"]];
    l.sort();
    return [l[0], l[1]];
  }

  handleVoteClick(event, pick) {
    event.preventDefault();
    if (this.state.voted) return;
    const isPublic = this.state.public;
    var [w1, w2] = this.alphabetizeWords();
    const vote = {
      pick,
      w1,
      w2,
      isPublic
    };

    fetch(VOTE_URL, {
      method: 'POST',
      body: JSON.stringify(vote),
      headers: {
        'content-type': 'application/json'
      }
    }).then( response => response.json())
    .then(result => {
      this.setState((state, props) => {
        var unionCount = 0;
        var unionSongs = [];
        var w1Votes = 0;
        var w2Votes = 0;
        if (result.unionData[0]) {
          unionCount = result.unionData[0].count;
          unionSongs = result.unionData[0].songs;
        }
        if (result.voteData) {
          w1Votes = result.voteData.w1.votes;
          w2Votes = result.voteData.w2.votes;
        }
        if (!result.w1Data[0] || !result.w2Data[0]) {
          return {
            voted: false,
            noResult: true,
          }
        }
        return {
          voteData: [
            {key: this.state.lyricsData[0]['key'], data: w1Votes},
            {key: this.state.lyricsData[1]['key'], data: w2Votes}
          ],
          lyricsData: [
            { key: this.state.lyricsData[0]['key'], data: result.w1Data[0].count},
            { key: this.state.lyricsData[1]['key'], data: result.w2Data[0].count},
            { key: this.state.lyricsData[2]['key'], data: unionCount}
          ],
          w1Songs: result.w1Data[0].songs,
          w2Songs: result.w2Data[0].songs,
          unionSongs: unionSongs,
          voted: true,
        }
      });
    });
  }

  handleRandomClick(event) {
    if (event) event.preventDefault();
    fetch(COMP_URL)
    .then( response => response.json())
    .then(result => {
      this.setState( (state, props) => {
        return {
          voteData: [
            {key: result[0].w1.word, data: 1},
            {key: result[0].w2.word, data: 1}
          ],
          lyricsData: [
            {key: [result[0].w1.word], data: 1},
            {key: [result[0].w2.word], data: 1},
            {key: [result[0].w1.word, result[0].w2.word], data: 1}
          ],
          w1Songs: [],
          w2Songs: [],
          unionSongs: [],
          voted: false,
          noResult: false,
        }
      });
    });
  }

  handleCustomClick(event) {
    event.preventDefault();
    this.setState( (state, props) => {
      return {
        customPopupActive: true,
      }
    });
  }

  handleArcClick(arc) {
    var popupSongs;
    if (arc.value.key == this.state.voteData[0]['key']) popupSongs = this.state.w1Songs;
    else if (arc.value.key == this.state.voteData[1]['key']) popupSongs = this.state.w2Songs;
    else popupSongs = this.state.unionSongs;
    this.setState( (state, props) => {
      return {
        songsPopupActive: popupSongs,
      }
    });
  }

  handlePopupClose() {
    this.setState( (state, props) => {
      return {
        songsPopupActive: null,
        customPopupActive: false,
      }
    });
  }

  handleSubmit(event, form) {
    event.preventDefault();
    if (!form.word1 || !form.word2) {
      this.setState( (state,props) => {
        return {
          customPopupActive: false,
        }
      });
      return;
    }
    var words = [form.word1, form.word2];
    words.sort();
    this.setState( (state, props) => {
      return {
        voteData: [
          {key: words[0], data: 1},
          {key: words[1], data: 1}
        ],
        lyricsData: [
          {key: [words[0]], data: 1},
          {key: [words[1]], data: 1},
          {key: [words[0], words[1]], data: 1}
        ],
        w1Songs: [],
        w2Songs: [],
        unionSongs: [],
        voted: false,
        songsPopupActive: null,
        customPopupActive: false,
        public: form.public,
        noResult: false,
      }
    });
  }

  render() {
    if (this.state.noResult) {
      return (
        <div className="app">
          <div className="title">
            Guess Which Word Appears in More Hit Songs...
          </div>
          <Question word1={this.state.voteData[0]['key']} word2={this.state.voteData[1]['key']} onClick={(event, pick) => this.handleVoteClick(event, pick)}/>
          <div>
            No results for songs containing {this.state.voteData[0]['key']} and {this.state.voteData[1]['key']}
          </div>
          <Result lyricsData={this.state.lyricsData} voteData={this.state.voteData} voted={this.state.voted} onClick={(arc) => this.handleArcClick(arc)}/>
          <NextQuestions onRandomClick={(event) => this.handleRandomClick(event)} onCustomClick={(event) => this.handleCustomClick(event)}/>
          <SongsPopup songsPopupActive={this.state.songsPopupActive} onClick={() => this.handlePopupClose()}/>
          <CustomPopup customPopupActive={this.state.customPopupActive} onClose={() => this.handlePopupClose()} onSubmit={(event, form) => this.handleSubmit(event, form)} />
        </div>
      );
    }
    return (
      <div className="app">
        <div className="title">
          Guess Which Word Appears in More Hit Songs...
        </div>
        <Question word1={this.state.voteData[0]['key']} word2={this.state.voteData[1]['key']} onClick={(event, pick) => this.handleVoteClick(event, pick)}/>
        <Result lyricsData={this.state.lyricsData} voteData={this.state.voteData} voted={this.state.voted} onClick={(arc) => this.handleArcClick(arc)}/>
        <NextQuestions onRandomClick={(event) => this.handleRandomClick(event)} onCustomClick={(event) => this.handleCustomClick(event)}/>
        <SongsPopup songsPopupActive={this.state.songsPopupActive} onClick={() => this.handlePopupClose()}/>
        <CustomPopup customPopupActive={this.state.customPopupActive} onClose={() => this.handlePopupClose()} onSubmit={(event, form) => this.handleSubmit(event, form)} />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
