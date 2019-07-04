$( function() {
	$( "#tabs" ).tabs();
	csc = new CourseSection("CSC226","A01","Dr.A","9:30-10:20",'MWF');
    ece310 = new CourseSection("ECE310", "A01", "Dr.B", "10:30-11:50", 'MH', false, "#00CED1");
	seng310 = new CourseSection("SENG310","A01","Dr.C","15:30-16:20",'MH',true,"#ADFF2F");
    csc2 = new CourseSection("CSC225", "A02", "Dr.BA", "10:30-11:20", 'MW', false, "#0000CD");
    ece320 = new CourseSection("ECE320", "A03", "Dr.BC", "12:30-13:50", 'MF', false, "#FF7F50");
    seng320 = new CourseSection("SENG320", "A01", "Dr.CD", "14:30-16:20", 'MH', false, "#FFD700");
	term1courses = [csc,ece310,seng310];
	term2courses = [csc2,ece320,seng320];
	tab1Table = createCourseTable(term1courses);
	tab2Table = createCourseTable(term2courses);
	$('#tabs-1').prepend(tab1Table);
	$('#tabs-2').prepend(tab2Table);
	$('#tabs-3').prepend(tab1Table);
  } );

class CourseSection 
{
	constructor(name,sectionNumber,prof,duration,days,registered=false, colour="white") {
		this.name = name;
		this.sectionNumber = sectionNumber;
		this.prof = prof;
		this.timePeriod = duration;
		var timePeriod = convertDurationToTimePeriod(duration);
		this.startTime = timePeriod[0];
		this.endTime = timePeriod[1];
		this.days = daysToArray(days);
        this.registered = registered;
        this.colour = colour
	}

	toString() {
		return this.name + " (" + this.sectionNumber + ")";
	}
}

function createCourseTable(classes)
{
	//Filter out un-registered classes.
	//We have to manually increment the index, because the array loses elements as we iterate.
	var i = 0;
	while(i < classes.length) {
		if(!classes[i].registered) {
			classes.splice(i, 1);
		}
		else{
			i++;
		}
	}

	//Base HTML for table
	var tableHTML = `
	<table id='timetable'>
			<tr>
				<th></th>
				<th>Monday</th>
				<th>Tuesday</th>
				<th>Wednesay</th>
				<th>Thursday</th>
				<th>Friday</th>
			</tr>
	`;
	
	//Find the first and last half-hours that will have classes in them.
	var first = 100;
	var last = -1;
	for(var i in classes) {
		if(classes[i].startTime < first) {
			first = classes[i].startTime;
		}
		if(classes[i].endTime > last) {
			last = classes[i].endTime;
		}
	}
	
	//For each possible time slot, check if a course is occuring during that timeslot
	for(var halfHour = first; halfHour < last; halfHour++)
	{
		tableHTML += "<tr>";
		var remainingDays = 6;
		var cellsChanged = false;
		//By default assume the table row is empty
		var cells = ["<td></td>","<td></td>","<td></td>","<td></td>",'<td></td>'];
		for(var index in classes)
		{
			//If a course starts at this half hour chunk, then for each day that it occurs, change the column to be that course
			if(classes[index].startTime == halfHour)
			{
				var rowSpan = classes[index].endTime - classes[index].startTime;
				for(ind in classes[index].days)
				{
					cellsChanged = true;
					console.log(index + " " + classes[index].color)
					cells[classes[index].days[ind]] = "<td rowspan = " + rowSpan + (classes[index].registered ? " style='background-color:"+classes[index].colour+"'" : '') + ">"+classes[index].name+"<br />"+classes[index].timePeriod+"</td>";
				}
			}
			//If the course <td> has already been created, make sure another one isn't created in the same timeslot
			else if(classes[index].startTime < halfHour && classes[index].endTime > halfHour)
			{
				for(ind in classes[index].days)
				{
					cellsChanged = true;
					cells[classes[index].days[ind]] = "";
				}
			}
		}
		 
		tableHTML += "<td>" + (Math.floor(halfHour / 2) + 8) + (halfHour % 2 == 0 ? ":00" : ":30") + "</td>" + cells.join('');
		
		
		tableHTML += "</tr>";
	}
	tableHTML += "</table>";
	//This is the "Selected classes Shown Here" area, all made into one cell. We can add logic to display classes in here.
	return tableHTML;
}

function convertDurationToTimePeriod(duration)
{
	dur = duration.split('-');
	reg = /(..?):(..?)/;
	start = reg.exec(dur[0]);
	reg2 = /(..?):(..?)/g;
	end = reg.exec(dur[1]);
	// Number of half-hours between 8:00 and the start time.
	startTime = (start[1]-8)*2 + (start[2]==="30" ? 1 : 0)
	// Number of half-hours (rounding up) between 8:00 and the end time.
	endTime = (end[1]-8)*2 + (end[2]==="20" ? 1 : 2);
	return [startTime,endTime];
}

function daysToArray(days) {
	var array = days.split('');
	var retArray = [];
	for(var i in array)
	{
		switch(array[i])
		{
			case 'M':
				retArray.push(0);
				break;
			case 'T':
				retArray.push(1);
				break;
			case 'W':
				retArray.push(2);
				break;
			case 'H':
				retArray.push(3);
				break;
			case 'F':
				retArray.push(4);
				break;
			default:
				retArray.push(3);
		}
	}
	return retArray;
}
