import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import search from './search';

/**
 * Geocoder component: connects to Mapbox.com Geocoding API
 * and provides an autocompleting interface for finding locations.
 */
class Geocoder extends Component {
  constructor (...args) {
    super(...args);

    this.state = {
      results: [],
      inputValue: '',
      isInputFocused: false,
      focus: null,
      loading: false,
      searchTime: new Date()
    };

    this.onFocusChange = this.onFocusChange.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onResult = this.onResult.bind(this);
  }

  componentDidMount () {
    if (this.props.focusOnMount) {
      ReactDOM.findDOMNode(this.refs.input).focus();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const isInputFocused = this.refs.input && document.activeElement === ReactDOM.findDOMNode(this.refs.input).getElementsByClassName('input')[0];
    if (isInputFocused !== prevState.isInputFocused) {
      this.setState({
        isInputFocused,
      });
    }
  }

  moveFocus (dir) {
    if(this.state.loading) return;

    this.setState({
      focus: this.state.focus === null ?
        0 : Math.max(0,
          Math.min(
            this.state.results.length - 1,
            this.state.focus + dir))
    });
  }

  acceptFocus () {
    if (this.state.focus !== null) {
      const place = this.state.results[this.state.focus];
      this.props.onSelect(place);
      this.setState({inputValue: place.place_name});
    }
  }

  clickOption (place, listLocation) {
    this.setState({
      focus:listLocation,
      inputValue: place.place_name
    }, () => this.props.onSelect(place));
    // focus on the input after click to maintain key traversal
    ReactDOM.findDOMNode(this.refs.input).focus();
    return false;
  }

  onFocusChange (focused) {
    setTimeout(() => {
      this.setState({
        isInputFocused: focused,
      });
    }, 100);
  }

  onInput (e) {
    this.setState({loading:true, inputValue: value});

    const { value } = e.target;
    if (value === '') {
      this.setState({
        results: [],
        focus: null,
        loading:false
      });
    } else {
      search(
        this.props.endpoint,
        this.props.source,
        this.props.accessToken,
        this.props.proximity,
        this.props.bbox,
        this.props.types,
        this.props.country,
        this.props.language,
        value,
        this.onResult
      );
    }
  }

  onKeyDown (e) {
    switch (e.which) {
      // up
      case 38:
        e.preventDefault();
        this.moveFocus(-1);
        break;
      // down
      case 40:
        this.moveFocus(1);
        break;
      // accept
      case 13:
        if( this.state.results.length > 0 && this.state.focus == null) {
          this.clickOption(this.state.results[0],0);
        }
        this.acceptFocus();
        break;
    }
  }

  onResult (err, res, body, searchTime) {
    // searchTime is compared with the last search to set the state
    // to ensure that a slow xhr response does not scramble the
    // sequence of autocomplete display.
    if (!err && body && body.features && this.state.searchTime <= searchTime) {
      this.setState({
        searchTime: searchTime,
        loading: false,
        results: body.features,
        focus: null
      });
      this.props.onSuggest(this.state.results);
    }
  }

  render () {
    let InputComponentClass = 'input';
    if (this.props.inputComponentClass) {
      InputComponentClass = this.props.inputComponentClass;
    }

    var input = (
      <InputComponentClass
        value={this.state.inputValue}
        ref="input"
        className={this.props.inputClass}
        onFocusChange={this.onFocusChange}
        onInput={this.onInput}
        onKeyDown={this.onKeyDown}
        placeholder={this.props.inputPlaceholder}
        type="text"
      />
    );

    return (
      <div>
        {this.props.inputPosition === 'top' && input}
        {this.state.results.length > 0 && this.state.isInputFocused && (
           <ul className={`${this.props.showLoader && this.state.loading ? 'loading' : ''} ${this.props.resultsClass}`}>
             {this.state.results.map((result, i) => (
               <li key={result.id}>
                 <a href='#'
                    onClick={this.clickOption.bind(this, result, i)}
                    className={this.props.resultClass + ' ' + (i === this.state.focus ? this.props.resultFocusClass : '')}
                    key={result.id}
                 >
                   {result.place_name}
                 </a>
               </li>
             ))}
           </ul>
        )}
        {this.props.inputPosition === 'bottom' && input}
      </div>
    );
  }
}

Geocoder.defaultProps = {
  endpoint: 'https://api.tiles.mapbox.com',
  inputClass: '',
  resultClass: '',
  resultsClass: '',
  resultFocusClass: 'strong',
  inputPosition: 'top',
  inputPlaceholder: 'Search',
  showLoader: false,
  source: 'mapbox.places',
  proximity: '',
  bbox: '',
  types: '',
  country: '',
  language: '',
  onSuggest: function() {},
  focusOnMount: true
};

Geocoder.propTypes = {
  endpoint: PropTypes.string,
  source: PropTypes.string,
  inputClass: PropTypes.string,
  resultClass: PropTypes.string,
  resultsClass: PropTypes.string,
  inputComponentClass: PropTypes.func,
  inputPlaceholder: PropTypes.string,
  inputPosition: PropTypes.string,
  resultFocusClass: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onSuggest: PropTypes.func,
  accessToken: PropTypes.string.isRequired,
  proximity: PropTypes.string,
  bbox: PropTypes.string,
  showLoader: PropTypes.bool,
  focusOnMount: PropTypes.bool,
  types: PropTypes.string,
  country: PropTypes.string,
  language: PropTypes.string
};

export default Geocoder;
