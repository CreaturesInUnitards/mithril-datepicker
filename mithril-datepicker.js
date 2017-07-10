if (typeof window.require === 'function') require('./style.sass')

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var longMonths = [0, 2, 4, 6, 7, 9, 11]

function adjustedDateObj(dateObj, delta) {
	var month = dateObj.month, year = dateObj.year
	month += delta

	var over = month > 11
	var under = month < 0

	return {
		month: over ? 0 : under ? 11 : month,
		year: over ? year + 1 : under ? year - 1 : year
	}
}

function lastDateInMonth(dateObj, delta) {
	var obj = adjustedDateObj(dateObj, delta)
	console.log(obj)
	if (longMonths.indexOf(obj.month) > -1) return 31
	if (obj.month === 1) {
		if (!(obj.year % 400)) return 29
		if (!(obj.year % 100)) return 28
		return (obj.year % 4) ? 28 : 29
	}

	return 30
}

function daysFromLastMonth(dateObj){
	var month = dateObj.month, year = dateObj.year
	var day = (new Date(year, month, 1)).getDay()
	var array = []
	if (day > 0) {
		var len = lastDateInMonth(dateObj, -1)
		for (var i=len-day+1; i<=len; i++) { array.push(i) }
	}
	return array
}

function daysFromThisMonth(dateObj) {
	var max = lastDateInMonth(dateObj, 0)
	var array = []
	for (var i=1; i<=max; i++) {
		array.push(i)
	}
	return array
}

function daysFromNextMonth(dateObj) {
	var month = dateObj.month, year = dateObj.year
	var lastDate = lastDateInMonth(dateObj, 0)
	var day = (new Date(year, month, lastDate)).getDay()
	var array = []
	if (day < 6) {
		for (var i=1; i<=6-day; i++) { array.push(i) }
	}
	return array
}

function setMonth(state, delta) {
	state.dateObj = adjustedDateObj(state.dateObj, delta) 
}

function displayDate(date) {
	return days[date.getDay()].substring(0, 3) + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear()
}

function classForDateBox(vnode, date) {
	// TODO: if the chosen date is visible but in 'other' month, it should still get the 'chosen' class
	var dateObj = vnode.state.dateObj
	if (dateObj.year !== vnode.state.date.getFullYear() || 
		dateObj.month !== vnode.state.date.getMonth()) return ''
	
	return (vnode.state.date.getDate() === date) ? 'chosen' : ''
}

function defaultDate(){
	var now = new Date()
	now.setHours(0, 0, 0, 0)
	return now
}

function chooseDate(vnode, e) {
	var box = e.target
	var date = parseInt(box.textContent)
	
	if (box.classList.contains('not-this-month')) {

		if (date > 6) { // 6 === max days to display from prev or next month
			setMonth(vnode.state, -1)
		}
		else if (date <= 6) {
			setMonth(vnode.state, 1)
		}
	}
	vnode.state.date.setYear(vnode.state.dateObj.year)
	vnode.state.date.setMonth(vnode.state.dateObj.month)
	vnode.state.date.setDate(date)

	vnode.state.active = false

	if (vnode.attrs.commit) vnode.attrs.commit(vnode.state.date)
}

var DatePicker = {
	active: false,
	oninit: function (vnode) {
		vnode.state.date = vnode.attrs.date || defaultDate()
		vnode.state.dateObj = {
			month: vnode.state.date.getMonth(),
			year: vnode.state.date.getFullYear()
		}
	},
	view: function (vnode) {
		var dateObj = vnode.state.dateObj
		return m('.container'
			, m('.mithril-date-picker'
				
				// chosen/default date display
				, m('button.current-date'
					, {
						onclick: function () {
							vnode.state.active = !vnode.state.active
							vnode.state.dateObj = {
								month: vnode.state.date.getMonth(),
								year: vnode.state.date.getFullYear()
							}
						}
					}
					, displayDate(vnode.state.date)
				)
				, vnode.state.active
					
					// calendar/picker
					? m('.calendar.incoming'
						, {
							oncreate: function (vnode) {
								requestAnimationFrame(function () { vnode.dom.classList.remove('incoming') })
							},
							onbeforeremove: function (vnode) {
								vnode.dom.classList.add('incoming')
								return new Promise(function (done) {
									setTimeout(done, 200)
								})
							}
						}
						
						// header
						, m('.month-header'
							, m('button.prev'
								, { onclick: setMonth.bind(null, vnode.state, -1) }
							)
							, m('button.month-year', months[dateObj.month] + ' ' + dateObj.year)
							, m('button.next'
								, { onclick: setMonth.bind(null, vnode.state, 1) }
							)
						)
						
						// weekday column labels
						, m('.weekdays'
							, days.map(function (day) {
								return m('.day.dummy', day.substring(0, 1))
							})
						)
						
						// clickable day blocks
						, m('.weekdays'
							, { onclick: chooseDate.bind(null, vnode) }
							, daysFromLastMonth(dateObj).map(function (date) {
								return m('button.day.not-this-month', date)
							})
							, daysFromThisMonth(dateObj).map(function (date) {
								return m('button.day'
									, { class: classForDateBox(vnode, date) }
									, m('.number', date)
								)
							})
							, daysFromNextMonth(dateObj).map(function (date) {
								return m('button.day.not-this-month', date)
							})
						)
					)
					: null
			)
		)
	}
}

if (typeof window.module === 'object') module.exports = DatePicker
else window.DatePicker = DatePicker