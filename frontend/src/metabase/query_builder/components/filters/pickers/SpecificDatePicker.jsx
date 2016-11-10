import React, { Component, PropTypes } from 'react';

import Calendar from "metabase/components/Calendar";
import Input from "metabase/components/Input";
import Icon from "metabase/components/Icon";
import ExpandingContent from "metabase/components/ExpandingContent";
import Tooltip from "metabase/components/Tooltip";
import NumericInput from "./NumericInput.jsx";

import { computeFilterTimeRange } from "metabase/lib/query_time";

import moment from "moment";
import cx from "classnames";

const DATE_FORMAT = "YYYY-MM-DD";
const DATE_TIME_FORMAT = "YYYY-MM-DDTHH:mm:ss";

export default class SpecificDatePicker extends Component {
    constructor() {
        super();

        this.state = {
            showCalendar: false
        }

        this.onChange = this.onChange.bind(this);
    }

    static propTypes = {
        value: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    onChange(date, hours, minutes) {
        let m = moment(date);
        if (!m.isValid()) {
            this.props.onChange(null);
        }

        let hasTime = false;
        if (hours != null) {
            m.hours(hours);
            hasTime = true;
        }
        if (minutes != null) {
            m.minutes(minutes);
            hasTime = true;
        }

        if (hasTime) {
            this.props.onChange(m.format(DATE_TIME_FORMAT));
        } else {
            this.props.onChange(m.format(DATE_FORMAT));
        }
    }

    render() {
        const { value } = this.props;
        const { showCalendar } = this.state;

        let date, hours, minutes;
        if (moment(value, DATE_TIME_FORMAT, true).isValid()) {
            date = moment(value, DATE_TIME_FORMAT, true);
            hours = date.hours();
            minutes = date.minutes();
            date.startOf("day");
        } else if (moment(value, DATE_FORMAT, true).isValid()) {
            date = moment(value, DATE_FORMAT, true);
        }

        return (
            <div className="px1">
                <div className="flex align-center mb1">
                    <div className="border-top border-bottom border-left">
                        <Input
                            className="borderless full p2 h4"
                            style={{
                                outline: 'none'
                            }}
                            value={date ? date.format("MM/DD/YYYY") : ""}
                            onBlurChange={({ target: { value } }) => {
                                let date = moment(value, "MM/DD/YYYY");
                                if (date.isValid()) {
                                    this.onChange(date, hours, minutes)
                                } else {
                                    this.onChange(null)
                                }
                            }}
                            ref="value"
                        />
                    </div>
                    <div className="border-right border-bottom border-top p2">
                        <Tooltip
                            tooltip={
                                showCalendar ? "Hide calendar" : "Show calendar"
                            }
                            children={
                                <Icon
                                    className="text-purple-hover cursor-pointer"
                                    name='calendar'
                                    onClick={() => this.setState({ showCalendar: !this.state.showCalendar })}
                                />
                            }
                        />
                    </div>
                </div>
                <ExpandingContent open={showCalendar}>
                    <Calendar
                        selected={date}
                        initial={date || moment()}
                        onChange={(value) => this.onChange(value, hours, minutes)}
                        isRangePicker={false}
                    />
                </ExpandingContent>

                <div className="py2 mx1">
                    { hours == null || minutes == null ?
                        <div
                            className="text-purple-hover cursor-pointer flex align-center"
                            onClick={() => this.onChange(date, 12, 30) }
                        >
                            <Icon
                                className="mr1"
                                name='clock'
                            />
                            Add a time
                        </div>
                    :
                        <HoursMinutes
                            clear={() => this.onChange(date, null, null)}
                            hours={hours}
                            minutes={minutes}
                            onChangeHours={hours => this.onChange(date, hours, minutes)}
                            onChangeMinutes={minutes => this.onChange(date, hours, minutes)}
                        />
                    }
                </div>
            </div>
        )
    }
}

const HoursMinutes = ({ hours, minutes, onChangeHours, onChangeMinutes, clear }) =>
    <div className="flex align-center">
        <NumericInput
            className="input"
            size={2}
            maxLength={2}
            value={(hours % 12) === 0 ? "12" : String(hours % 12)}
            onChange={(value) => onChangeHours((hours >= 12 ? 12 : 0) + value) }
        />
        <span className="px1">:</span>
        <NumericInput
            className="input"
            size={2}
            maxLength={2}
            value={minutes}
            onChange={(value) => onChangeMinutes(value) }
        />
        <div className="flex align-center pl1">
            <span className={cx("text-brand-hover mr1", { "text-brand": hours < 12, "cursor-pointer": hours >= 12 })} onClick={hours >= 12 ? () => onChangeHours(hours - 12) : null}>AM</span>
            <span className={cx("text-brand-hover mr1", { "text-brand": hours >= 12, "cursor-pointer": hours < 12 })} onClick={hours < 12 ? () => onChangeHours(hours + 12) : null}>PM</span>
        </div>
        <Icon
            className="text-grey-2 cursor-pointer text-grey-4-hover"
            name="close"
            onClick={() => clear() }
        />
    </div>
