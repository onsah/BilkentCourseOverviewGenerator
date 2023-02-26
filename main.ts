import {
  DOMParser,
  Element,
  Node,
  NodeList,
} from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";

function throwExpression(errorMessage: string): never {
  throw new Error(errorMessage);
}

function toArray(nodeList: NodeList): Node[] {
  const arrayToReturn: Node[] = [];

  nodeList.forEach((node) => arrayToReturn.push(node));

  return arrayToReturn;
}

const domParser = new DOMParser();

async function extractCourseOverview(url: string): Promise<string> {
  let courseOveriew = "";

  // Fetch  body
  const response = await fetch(url);
  const bodyString = await response.text();

  // Parse body
  const htmlDoc = domParser.parseFromString(bodyString, "text/html") ??
    throwExpression("Unexpected");

  // Course title
  const courseTitleText = (
    htmlDoc.querySelector(".syllabusContainer > h1:nth-child(1)") ??
      throwExpression("Unexpected")
  ).textContent;
  const courseTitle = courseTitleText
    .split("-")
    .slice(1)
    .join(" ")
    .trim();
  courseOveriew += courseTitle;
  courseOveriew += " | ";

  // Total hours
  const workloadTableParent = (
    toArray(
      htmlDoc.querySelectorAll(
        ".syllabusContainer > table:nth-child(3) > tbody:nth-child(1) > tr",
      ),
    ).find((tableRow) =>
      tableRow.textContent.includes("ECTS - Workload Table:")
    ) ?? throwExpression("Unexpected")
  ) as Element;

  const workloadTable =
    workloadTableParent.querySelector("td > table > tbody") ??
      throwExpression("Unexpected");

  const totalWorkloadRow = (
    toArray(
      workloadTable.querySelectorAll("tr"),
    ).find((row) => row.textContent.includes("Total Workload")) ??
      throwExpression("Unexpected")
  ) as Element;

  // console.log(`Total workload: ${totalWorkloadRow.textContent}`);

  const totalHours = (
    totalWorkloadRow.querySelector("td:nth-child(2)") ??
      throwExpression("Unexpected")
  ).textContent;

  courseOveriew += totalHours;
  courseOveriew += " | ";

  // Course Description
  const description = (
    htmlDoc.querySelector(
      ".syllabusContainer > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1)",
    ) ??
      throwExpression("Unexpected")
  ).textContent
    .split("\n")[2]
    .trim();

  courseOveriew += description;
  courseOveriew += " | ";

  // Textbooks
  const textBookList = toArray(
    (
      htmlDoc.querySelector(
        ".syllabusContainer > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1)",
      ) ??
        throwExpression("Unexpected")
    ).querySelectorAll("ul > li"),
  ).map(
    (node) =>
      node.textContent
        .split("-")
        .slice(1)
        .join(" ")
        .trim(),
  )
    .join("<br />");

  courseOveriew += textBookList;

  return courseOveriew;
}

type Courses = Record<string, string[]>;

function handleCourse(
  departmentName: string,
  courseCode: string,
): Promise<string> {
  const url =
    `https://stars.bilkent.edu.tr/syllabus/view/${departmentName}/${courseCode}`;

  return extractCourseOverview(url);
}

const coursesFileContent = await Deno.readTextFile("courses.json");
const courses: Courses = JSON.parse(coursesFileContent);

const overviews = await Promise.all(
  Object.keys(courses)
    .flatMap(
      (departmentName) =>
        courses[departmentName]
          .map(
            (courseCode) => handleCourse(departmentName, courseCode),
          ),
    ),
);

const DOCUMENT_HEADER = `
| Course title | Hours | Description | Literature Used |
| - | - | - | - |
`.trim();

const document =`
${DOCUMENT_HEADER}
${overviews.join("\n")}
`;

// Output document
await Deno.writeTextFile(
  "CourseOverviews.md",
  document, 
  { create: true, append: false, },
);
