$( function() {
    $( "#tabs" ).tabs();
	csc = new CourseSection("CSC226","A01","Dr.A","9:30-10:20",'MWF');
	ece310 = new CourseSection("ECE310","A01","Dr.B","10:30-12:20",'MH');
    seng310 = new CourseSection("SENG310","A01","Dr.C","15:30-16:20",'MH',true);
    csc2 = new CourseSection("CSC225","A02","Dr.BA","10:30-11:20",'MW');
	ece320 = new CourseSection("ECE320","A03","Dr.BC","12:30-13:20",'MF');
	seng320 = new CourseSection("SENG320","A01","Dr.CD","14:30-16:20",'MH');
    courses = [csc,ece310,seng310];
    courses2 = [csc2,ece320,seng320];
    tab1Table = createCourseTable(courses);
    tab2Table = createCourseTable(courses2);
	$('#tabs-1').prepend(tab1Table);
	$('#tabs-2').prepend(tab2Table);
	$('#tabs-3').prepend(tab1Table);
  } );
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
        this.registered=registered;
    }

}
function createCourseTable(courses)
{
    //Base HTML for table
    var tableHTML = `
	<table class='nav'>
			<tr>
				<td>Monday</td>
				<td>Tuesday</td>
				<td>Wednesay</td>
				<td>Thursday</td>
				<td>Friday</td>
				<td>Selected Courses Shown here</td>
			</tr>
    `;
	var firstCellSet = false;
    //For each possible time slot, check if a course is occuring during that timeslot
	for(var halfHour = 0; halfHour < 30; halfHour++)
	{
		tableHTML += "<tr>";
		var remainingDays = 6;
        var cellsChanged = false;
        //By default assume the table row is empty
		var cells = ["<td></td>","<td></td>","<td></td>","<td></td>",'<td></td>'];
		for(var index in courses)
		{
            //If a course starts at this half hour chunk, then for each day that it occurs, change the column to be that course
			if(courses[index].startTime == halfHour)
			{
				var rowSpan = courses[index].endTime - courses[index].startTime;
				for(ind in courses[index].days)
				{
					cellsChanged = true;
					cells[courses[index].days[ind]] = "<td rowspan = " + rowSpan + (courses[index].registered ? " style='background-color:#CCC'" : '') + ">"+courses[index].name+"<br />"+courses[index].timePeriod+"</td>";
				}
            }
            //If the course <td> has already been created, make sure another one isn't created in the same timeslot
			else if(courses[index].startTime < halfHour && courses[index].endTime > halfHour)
			{
				for(ind in courses[index].days)
				{
					cellsChanged = true;
					cells[courses[index].days[ind]] = "";
				}
			}
        }
        //If the row isn't empty, add it to the table
		if(cellsChanged)
		{
			tableHTML += cells.join('');
			if(!firstCellSet)
			{
                //This is the "Selected Courses Shown Here" area, all made into one cell to avoid columns - can add logic to display courses in here
				tableHTML += "<td rowspan = 30 style='vertical-align:top'><div style='margin:10px;border:1px solid black'>Search</div></td>";
            }
            
			firstCellSet = true;
		}
		
		tableHTML += "</tr>";
    }
    tableHTML += "</table>";
    return tableHTML;
}
function convertDurationToTimePeriod(duration)
{
    dur = duration.split('-');
    reg = /(..?):(..?)/;
    start = reg.exec(dur[0]);
    reg2 = /(..?):(..?)/g;
    end = reg.exec(dur[1]);
    startTime = (start[1]-8)*2 + (start[2]==="30" ? 1 : 0)
    endTime = (end[1]-8)*2 + (end[2]==="20" ? 1 : 0);
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