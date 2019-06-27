$(function () {
	$( "#tabs" ).tabs();
	csc = new CourseSection("CSC226","A01","Dr.A","9:30-10:20",'MWF');
	ece310 = new CourseSection("ECE310","A01","Dr.B","10:30-11:50",'MH');
	seng310 = new CourseSection("SENG310","A01","Dr.C","15:30-16:20",'MH',true);
	csc2 = new CourseSection("CSC225","A02","Dr.BA","10:30-11:20",'MW');
	ece320 = new CourseSection("ECE320","A03","Dr.BC","12:30-13:50",'MF');
	seng320 = new CourseSection("SENG320","A01","Dr.CD","14:30-16:20",'MH');
	term1courses = [csc,ece310,seng310];
	term2courses = [csc2,ece320,seng320];
    tab1Table = createCourseTable(term1courses,"Term1");
    tab2Table = createCourseTable(term2courses, "Term2");
    tabEmptyTable = createCourseTable([], "Term1");

	$('#tabs-1').prepend(tabEmptyTable);
	$('#tabs-2').prepend(tab2Table);
    $('#tabs-3').prepend(tab1Table);
    
    $('body').on('click','.addCourse',function (event) {
        console.log(event.target.innerText)
        console.log(courses[event.target.innerText]);
    })

}
);
tab1CoursesShown = false;
class Course
{

    constructor(name, sections) {
        this.name = name;
        this.sections = sections;
    }
}
class CourseSection 
{
	constructor(name,sectionNumber,prof,duration,days,registered=false) {
		this.name = name;
		this.sectionNumber = sectionNumber;
		this.prof = prof;
		this.timePeriod = duration;
		var timePeriod = convertDurationToTimePeriod(duration);
		this.startTime = timePeriod[0];
		this.endTime = timePeriod[1];
		this.days = daysToArray(days);
		this.registered = registered;
	}
}
function createSuggestionsDiv()
{

}
function createCourseTable(names,courses,termName)
{
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
    if (courses.length == 0) {
        console.log("Hi");
        tableHTML += "<tr><td colspan=6 style='height:500px'>Add some courses to begin</td></tr>";
    }
    else {
        //Find the first and last half-hours that will have classes in them.
        var first = 100;
        var last = -1;
        for (var i in courses) {
            if (courses[i].startTime < first) {
                first = courses[i].startTime;
            }
            if (courses[i].endTime > last) {
                last = courses[i].endTime;
            }
        }

        //For each possible time slot, check if a course is occuring during that timeslot
        for (var halfHour = first; halfHour < last; halfHour++) {
            tableHTML += "<tr>";
            var remainingDays = 6;
            var cellsChanged = false;
            //By default assume the table row is empty
            var cells = ["<td></td>", "<td></td>", "<td></td>", "<td></td>", '<td></td>'];
            for (var index in courses) {
                //If a course starts at this half hour chunk, then for each day that it occurs, change the column to be that course
                if (courses[index].startTime == halfHour) {
                    var rowSpan = courses[index].endTime - courses[index].startTime;
                    for (ind in courses[index].days) {
                        cellsChanged = true;
                        cells[courses[index].days[ind]] = "<td rowspan = " + rowSpan + (courses[index].registered ? " style='background-color:#CCC'" : '') + ">" + courses[index].name + "<br />" + courses[index].timePeriod + "</td>";
                    }
                }
                //If the course <td> has already been created, make sure another one isn't created in the same timeslot
                else if (courses[index].startTime < halfHour && courses[index].endTime > halfHour) {
                    for (ind in courses[index].days) {
                        cellsChanged = true;
                        cells[courses[index].days[ind]] = "";
                    }
                }
            }

            tableHTML += "<td>" + (Math.floor(halfHour / 2) + 8) + (halfHour % 2 == 0 ? ":00" : ":30") + "</td>" + cells.join('');


            tableHTML += "</tr>";
        }
        tableHTML += "</table>";
        //This is the "Selected Courses Shown Here" area, all made into one cell. We can add logic to display courses in here.
        
    }
    tableHTML += "<table><th>Selected Courses</th></tr><tr><td rowspan = 30 style='vertical-align:top; float:left; width:100%; height:500px;'><div id='courseOptions_" + termName + "'><input style='margin:10px;border:1px solid black' placeholder='Search' onclick='showCourses(\"" + termName + "\"," + JSON.stringify(courses) + ")'></input></div></td></tr></table>";
    return tableHTML;
}

function showCourses(term,courses) {
    if (!tab1CoursesShown)
    {
        console.log(term);
        console.log(courses);
        var divHTML = `<table>
                        <tr>
                            <td class='addCourse `+term+`'>CSC 226</td>
                        </tr>
                        <tr>
                            <td class='addCourse `+ term +`'>SENG 310</td>
                        </tr>
                      </table>`;
        $('#courseOptions_' + term).append(divHTML);;
        console.log(document.getElementById("courseOptions_" + term).innerHTML);
        tab1CoursesShown = true;
    }

}

//This creates the HTML to fill in the right sidebar with the details of the courses that have been selected, given this list of courses.
function createSelectedCoursesSidebar (selectedCourses) {
	var sidebarHTML = "<table id='sidebar'><form>"
	for(var i in selectedCourses) {
		sidebarHTML += "<tr>";
		for (var property in courses[i]) {
			if(courses[i].hasOwnProperty(property)) {
				sidebarHTML += "<td><input type='radio'></td>" + "<td>" + courses[i][property] + "</td>";
			}
		}
		sidebarHTML += "</tr>";
	}
	return sidebarHTML + "</form></table>";
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
