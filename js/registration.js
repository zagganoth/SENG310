$(function () {
    $("#tabs").tabs();
    //Generate new course section objects
	csc = new CourseSection("CSC226","A01","Dr.A","9:30-10:20",'MWF');
	ece310 = new CourseSection("ECE310","A01","Dr.B","10:30-11:50",'MH');
	seng310 = new CourseSection("SENG310","A01","Dr.C","15:30-16:20",'MH',true);
	csc2 = new CourseSection("CSC225","A02","Dr.BA","10:30-11:20",'MW');
	ece320 = new CourseSection("ECE320","A03","Dr.BC","12:30-13:50",'MF');
    seng320 = new CourseSection("SENG320", "A01", "Dr.CD", "14:30-16:20", 'MH');
    //Generate a static list of courses for terms 2 and 3
	term3courses = [csc,ece310,seng310];
	term2courses = [csc2,ece320,seng320];
    tab3Table = createCourseTable(term3courses,"Term3");
    tab2Table = createCourseTable(term2courses, "Term2");
    //For term 1, start off with an empty table
    tabEmptyTable = createCourseTable([], "Term1");
    tabEmptyTable += createCourseOptionsTable([], "Term1");
    //Initialize each tab with the respective table
	$('#tabs-1').prepend(tabEmptyTable);
	$('#tabs-2').prepend(tab2Table);
	$('#tabs-3').prepend(tab3Table);
	//List of the CourseSection objects that make up the current timetable for term 1
	var currentSections = [];
	//List of the names of the classes currently selected
	var currentClasses = [];
	
	//Trigger this function if a course from the courses dropdown menu is selected
    $('body').on('click', '.addCourse', function (event) {
        //The .courseName div from the clicked object contains the name of the course selected
        //Thus, we can get information about the course by searching the 'courses' dictionary in courses.js for that course
        var courseFromSave = courses[$(event.target).find('.courseName').prevObject.text()]
        //Only allow for selection of a course if it has recommendationLevel 2 (green - no prereqs or coreqs missing)
		if(courseFromSave.recommendationLevel == 2)
		{
			courseFromSave = courseFromSave.sections[0];
			courseFromSave["name"] = event.target.innerText;
			currentClasses.push(event.target.innerText);
			var course = new CourseSection(courseFromSave.name, courseFromSave.section, courseFromSave.prof, courseFromSave.duration, courseFromSave.days, courseFromSave.registered,courseFromSave.recommendationLevel);
            currentSections.push(course);
            //generateTab(currentSections,"Term1",cur)

            tabTable = createCourseTable(currentSections, "Term1");
            tabTable += createCourseOptionsTable(currentSections, "Term1");
			$('#tabs-1').html(tabTable);
			document.getElementById('selectedCourses').innerHTML += createSelectedCoursesSidebar(currentSections);
			tab1CoursesShown = false;
		}
    })
	$('body').on('click','input:radio',function(event)
	{
		//Get the TR containing the radio button
		var parentRow = $(event.target).parent().parent();
		var sectionName = $(parentRow).find('.sectionName').text();
		var courseName = $(parentRow).parent().find('.courseName').text();
		var sectionReg = /A0([0-9])/;
		var sectionNum = sectionReg.exec(sectionName)[1]-1;

		for(var index in currentSections)
		{
			if(currentSections[index].name == courseName)
			{
				var courseFromSave = courses[courseName].sections[sectionNum];
				courseFromSave["name"] = courseName;
				var course = new CourseSection(courseFromSave.name, courseFromSave.section, courseFromSave.prof, courseFromSave.duration, courseFromSave.days, courseFromSave.registered,courseFromSave.recommendationLevel);
				currentSections[index] = course;
				break;
			}
		}
        tabTable = createCourseTable(currentSections, "Term1");
        tabTable += createCourseOptionsTable(currentSections, "Term1");
		$('#tabs-1').html(tabTable);
		document.getElementById('selectedCourses').innerHTML += createSelectedCoursesSidebar(currentSections);
    })
}
);

tab1CoursesShown = false;
tab1CoursesHidden = false;
class Course
{

    constructor(name, sections) {
        this.name = name;
        this.sections = sections;
    }
}
class CourseSection 
{
	constructor(name,sectionNumber,prof,duration,days,registered=false,recommendationLevel=0) {
		this.name = name;
		this.section = sectionNumber;
		this.prof = prof;
		this.timePeriod = duration;
		var timePeriod = convertDurationToTimePeriod(duration);
		this.startTime = timePeriod[0];
		this.endTime = timePeriod[1];
		this.days = daysToArray(days);
		this.registered = registered;
		this.recommendationLevel = this.recommendationLevel;
	}
}

function createCourseTable(classes,termName)
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
	if (classes.length == 0) 
	{
        tableHTML += "<tr><td colspan=6 style='height:500px'>Add some classes to begin</td></tr>";
    }
	else 
	{
        //Find the first and last half-hours that will have classes in them.
        var first = 100;
        var last = -1;
        for (var i in classes) {
            if (classes[i].startTime < first) {
                first = classes[i].startTime;
            }
            if (classes[i].endTime > last) {
                last = classes[i].endTime;
            }
        }
        var rowCount = 0;
        //For each possible time slot, check if a course is occuring during that timeslot
        for (var halfHour = first; halfHour < last; halfHour++) {
            tableHTML += "<tr>";
            var remainingDays = 6;
            var cellsChanged = false;
            //By default assume the table row is empty
            var cells = ["<td></td>", "<td></td>", "<td></td>", "<td></td>", '<td></td>'];
            for (var index in classes) {
                //If a course starts at this half hour chunk, then for each day that it occurs, change the column to be that course
                if (classes[index].startTime == halfHour) {
                    var rowSpan = classes[index].endTime - classes[index].startTime;
                    for (ind in classes[index].days) {
                        cellsChanged = true;
                        cells[classes[index].days[ind]] = "<td rowspan = " + rowSpan + (classes[index].registered ? " style='background-color:#CCC'" : '') + ">" + classes[index].name + "<br />" + classes[index].timePeriod + "</td>";
                        rowCount++;
                    }
                }
                //If the course <td> has already been created, make sure another one isn't created in the same timeslot
                else if (classes[index].startTime < halfHour && classes[index].endTime > halfHour) {
                    for (ind in classes[index].days) {
                        cellsChanged = true;
                        cells[classes[index].days[ind]] = "";
                    }
                }
            }

            tableHTML += "<td>" + (Math.floor(halfHour / 2) + 8) + (halfHour % 2 == 0 ? ":00" : ":30") + "</td>" + cells.join('');


            tableHTML += "</tr>";
        }
        if (rowCount < 17) {
            var cells = ["<td></td>", "<td></td>", "<td></td>", "<td></td>", '<td></td>'];
            for (var halfHour = rowCount; halfHour < 17; halfHour++) {
                tableHTML += "<tr><td>" + (Math.floor(halfHour / 2) + 8) + (halfHour % 2 == 0 ? ":00" : ":30") + "</td>" + cells.join('')+"</tr>";
            }

        }
        //This is the "Selected classes Shown Here" area, all made into one cell. We can add logic to display classes in here.
        
	}
	tableHTML += `<tr>
						<td class='fakeButton' colspan=2>
							Save
						</td>
						<td class='fakeButton' colspan=2>
							Auto-Generate
						</td>
						<td class='fakeButton' colspan=2>
							Register
						</td>
				  </tr>`;
    tableHTML += "</table>";
    /*
    tableHTML += `<table width='250px'>
                    <tr>
                        <th>Selected classes</th>
                    </tr>
                    <tr>
                        <td rowspan = 30 id='selectedclasses' style='vertical-align:top; float:left; width:100%; height:500px;'>
                            <div id='courseOptions_` + termName + `'>
                                <input class='termSearch' style='margin-top:5px;border-radius:9px;width:100%;border:1px solid grey;padding:2px' placeholder='Search' onclick='showclasses("` + termName + `",` + JSON.stringify(classes) + `)'></input>
                            </div>
                        </td>
                    </tr>
				  </table>`;*/
    return tableHTML;
}
function createCourseOptionsTable(courses,termName)
{
    return  `<table width='250px'>
                    <tr>
                        <th>Selected Courses</th>
                    </tr>
                    <tr>
                        <td rowspan = 30 id='selectedCourses' style='vertical-align:top; float:left; width:100%; height:500px;overflow:auto'>
                            <div id='courseOptions_` + termName + `'>
                                <input class='termSearch' style='margin-top:5px;border-radius:9px;width:100%;border:1px solid grey;padding:2px' placeholder='Search' onclick='showCourses("` + termName + `",` + JSON.stringify(courses) + `)'></input>
                            </div>
                        </td>
                    </tr>
				  </table>`;
}

// Generates the list of courses that can be added when the cursor is in the search field.
function showCourses(term,selectedCourses) {
    if (!tab1CoursesShown)
    {
        var divHTML = `<table style='width:100%;border-collapse:collapse;' id='term1Courses'>`;
        for(courseIndex in courses)
        {
            var toAdd = true;
            for (index in selectedCourses) {
                if (selectedCourses[index]["name"] == courseIndex)
                    toAdd = false;
            }
            if(toAdd) {
                divHTML += "<tr class='searchRow'><td class='addCourse " + term + " " + getClassForRecLevel(courses[courseIndex]["recommendationLevel"])+"'><div class='courseName'>" + courseIndex + "</div><button class='helpButton'>?</button></td></tr>";
			}
        }
        divHTML += "</table>";
        $('#courseOptions_' + term).append(divHTML);;
		yellowCourses = document.getElementsByClassName('yellowCourse');
		for(index in yellowCourses)
		{

			yellowCourses[index].innerHTML += `<div class='reqInfo'>Co-Requisites Missing</div>`;
		}
		redCourses = document.getElementsByClassName('redCourse');
		for(index in redCourses)
		{

			redCourses[index].innerHTML += `<div class='reqInfo'>Pre-Requisites Missing</div>`;
		}
        tab1CoursesShown = true;
	}
}
function getClassForRecLevel(recLevel)
{
	switch(recLevel)
	{
		case 0:
			return "redCourse";
		case 1:
			return "yellowCourse";
		case 2:
			return "greenCourse";
		default:
			return "redCourse";
	}
}
//This creates the HTML to fill in the right sidebar with the details of the courses that have been selected, given this list of courses.
function createSelectedCoursesSidebar (selectedCourses)
{
	var sidebarHTML = ``;
	for(var i in selectedCourses) {
		var sections = courses[selectedCourses[i]["name"]]["sections"];
		sidebarHTML += "<table>";
		sidebarHTML += "<tr><th colspan=3 class='courseName'>"+selectedCourses[i]["name"]+"</th></tr>";
        for (var index in sections) {
            sidebarHTML += "<tr>";
            sidebarHTML += "<td class='noBorder' style='width:3%'><input type='radio' name='sections_" + selectedCourses[i]["name"].replace(/\s/g, '') + "' " + (selectedCourses[i]["section"]==sections[index]["section"] ? "checked" : "") + "></td>" + "<td class='noBorder sectionName'>" + sections[index]["section"] + "</td>";
			sidebarHTML += "<td class='noBorder'>"+sections[index]["prof"]+"</td>";
			sidebarHTML += "<td class='noBorder'>"+sections[index]["duration"]+"</td>";
			sidebarHTML += "<td class='noBorder'>"+sections[index]["days"]+"</td>";
			sidebarHTML += "</tr>";
		}
		sidebarHTML += "</table>";
	}
	return sidebarHTML + "";
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
