"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from "react";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import AssignAnalyst from "./AssignTeam";
import Modal from "../ui/Modal";
import { useQuery } from "@tanstack/react-query";
import { querykeys } from "@/lib/constant";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { Assignment } from "@/types";

// Extend dayjs with all necessary plugins
dayjs.extend(localeData);
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

// On-call assignments data (using a consistent interface for better type safety)

// const assignments: Assignment[] = [];

// Helper functions (no changes needed here)
export const getDaysInMonth = (year: number, month: number) => {
  return dayjs().year(year).month(month).daysInMonth();
};

export const getDaysInPreviousMonth = (year: number, month: number) => {
  const prevMonth = dayjs().year(year).month(month).subtract(1, "month");
  const daysInPrevMonth = prevMonth.daysInMonth();
  return Array.from({ length: daysInPrevMonth }, (_, i) => i + 1);
};

// Reusable Button Component for styling consistency
interface DayButtonProps {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  assignment?: Assignment | null;
  dateValue: dayjs.Dayjs; // Pass the full date object
  onSelect: (
    date: dayjs.Dayjs,
    members?: {
      email: string;
      firstName: string;
      lastName: string;
      member: string;
      startTime: string;
      endTime: string;
    }[]
  ) => void; // Add selection handler
  isSelected: boolean; // New prop for selected state styling
  // ⭐️ NEW PROP: To indicate if the day is in the past
  isPast: boolean;
}

const DayButton: React.FC<DayButtonProps> = ({
  day,
  isCurrentMonth,
  isToday,
  assignment,
  dateValue,
  onSelect,
  isSelected,
  // ⭐️ Destructure the new prop
  isPast,
}) => {
  const handleClick = useCallback(() => {
    // ⭐️ Prevent selection of past days and days outside the current month
    if (!isPast) {
      onSelect(dateValue, assignment?.teamMembers);
    }
  }, [dateValue, onSelect, assignment, isPast]); // Add isPast to dependencies

  // ⭐️ Conditional classes for past days
  const pastDayClasses = isPast
    ? "bg-[#252C3F] opacity-50 text-white cursor-not-allowed shadow-none"
    : "bg-[#252C3F] text-white cursor-pointer shadow-sm";

  return (
    <div
      onClick={handleClick}
      // ⭐️ Apply conditional classes, prioritizing isSelected and isToday, then isPast
      className={`w-full h-24 p-2 flex flex-col justify-center items-center rounded-lg transition-all duration-300 ease-in-out
        ${pastDayClasses}
        ${
          isToday && isCurrentMonth && !isPast
            ? "bg-IMSLightGreen text-white hover:text-gray-200"
            : ""
        }
        ${
          isSelected
            ? "!bg-IMSLightGreen border-4 "
            : ""
        }
      `}
    >
      {assignment ? (
        <div>
          {assignment.teamMembers.map((team) => (
            <div key={team.member}>
              <div
                className={`text-xs font-semibold text-center mt-2 ${
                  isPast ? "text-gray-500" : "text-green-600"
                }`}
              >
                {team.firstName}
                <br />
                {team.startTime}- {team.endTime}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xl font-medium">{day}</span>
      )}
    </div>
  );
};

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [openAssignmentForm, setOpenAssignmentForm] = useState(false);
  // ⭐️ New state to store the selected date
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>();
  const [currentMembers, setCurrentMembers] = useState<
    | {
        email: string;
        firstName: string;
        lastName: string;
        member: string;
        startTime: string;
        endTime: string;
      }[]
    | null
    | undefined
  >(null);
  const { get } = useFetch();
  const { data } = useQuery<Assignment[] | null>({
    queryKey: [querykeys.GET_ALL_ASSIGN],
    queryFn: async () => {
      const res = await get(endpoint.on_call.get_all_assign);
      console.log(res);
      if (res.success) {
        return res.data.data;
      }
      return null;
    },
  });

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = dayjs()
    .year(currentYear)
    .month(currentMonth)
    .startOf("month")
    .day();
  const daysInPreviousMonth = getDaysInPreviousMonth(currentYear, currentMonth);
  // ⭐️ Define today's date for comparison, keeping only the date part
  const today = dayjs().startOf("day");

  // ⭐️ Handler for selecting a date
  const handleDaySelect = useCallback(
    (
      date: dayjs.Dayjs,
      members?:
        | {
            email: string;
            firstName: string;
            lastName: string;
            member: string;
            startTime: string;
            endTime: string;
          }[]
        | undefined
    ) => {
      setSelectedDate(date);
      setCurrentMembers(members);
      // setOpenAssignmentForm(true); // Open the modal on selection
      console.log(`Date selected: ${date.format("YYYY-MM-DD")}`);
    },
    []
  );

  const renderDays = () => {
    const days = [];
    const firstDayOfMonth = dayjs()
      .year(currentYear)
      .month(currentMonth)
      .date(1);

    // Render Previous Month's days
    const prevMonthDays = daysInPreviousMonth.slice(-startDay);
    const prevMonthDate = firstDayOfMonth.subtract(1, "month");
    for (const day of prevMonthDays) {
      const dateValue = prevMonthDate.date(day);
      const isSelected = selectedDate
        ? dateValue.isSame(selectedDate, "day")
        : false;
      // ⭐️ Check if the date is in the past
      const isPast = dateValue.isBefore(today, "day");

      days.push(
        <DayButton
          key={`prev-${day}`}
          day={day}
          isCurrentMonth={false}
          isToday={false}
          dateValue={dateValue}
          onSelect={handleDaySelect}
          isSelected={isSelected}
          // ⭐️ Pass the new prop
          isPast={isPast}
        />
      );
    }

    // Render Current Month's days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const currentDate = firstDayOfMonth.date(day);
      const isToday = currentDate.isSame(today, "day");
      const isSelected = selectedDate
        ? currentDate.isSame(selectedDate, "day")
        : false;
      // ⭐️ Check if the date is in the past
      const isPast = currentDate.isBefore(today, "day");

      const assignedPerson = data?.find((assignment) =>
        currentDate.isSame(dayjs(assignment.date), "day")
      );
      days.push(
        <DayButton
          key={`current-${day}`}
          day={day}
          isCurrentMonth={true}
          isToday={isToday}
          assignment={assignedPerson}
          dateValue={currentDate}
          onSelect={handleDaySelect}
          isSelected={isSelected}
          // ⭐️ Pass the new prop
          isPast={isPast}
        />
      );
    }

    // Render Next Month's days
    const totalDays = days.length;
    const nextMonthDaysToAdd = 42 - totalDays; // 6 rows * 7 days
    const nextMonthDate = firstDayOfMonth.add(1, "month");
    for (let day = 1; day <= nextMonthDaysToAdd; day++) {
      const dateValue = nextMonthDate.date(day);
      const isSelected = selectedDate
        ? dateValue.isSame(selectedDate, "day")
        : false;
      // ⭐️ Check if the date is in the past
      const isPast = dateValue.isBefore(today, "day");

      days.push(
        <DayButton
          key={`next-${day}`}
          day={day}
          isCurrentMonth={false}
          isToday={false}
          dateValue={dateValue}
          onSelect={handleDaySelect}
          isSelected={isSelected}
          // ⭐️ Pass the new prop
          isPast={isPast}
        />
      );
    }

    return days;
  };

  const dayLabels = dayjs().localeData().weekdays();

  return (
    <div className="rounded-lg w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">Calendar & quiet exceptions</h2>
        <div className="flex space-x-4">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="p-2 border rounded-md text-sm"
          >
            {dayjs()
              .localeData()
              .months()
              .map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="p-2 border rounded-md text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => dayjs().year() + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="bg-IMSCyan text-sm text-black rounded-md p-3 text-center font-semibold"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>

      <Modal
        isOpen={openAssignmentForm}
        onClose={() => setOpenAssignmentForm(false)}
      >
        <AssignAnalyst
          date={selectedDate?.format("YYYY-MM-DD") ?? ""}
          onClose={() => setOpenAssignmentForm(false)}
          previousMember={currentMembers}
        />
        {/* You can pass selectedDate to AssignAnalyst here if needed */}
      </Modal>
    </div>
  );
};

export default Calendar;
