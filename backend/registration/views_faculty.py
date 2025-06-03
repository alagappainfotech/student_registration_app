from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Faculty, Enrollment, Course, Student
from .serializers import CourseSerializer, StudentSerializer
from django.shortcuts import get_object_or_404

class FacultyCoursesView(APIView):
    def get(self, request, faculty_id):
        faculty = get_object_or_404(Faculty, id=faculty_id)
        enrollments = Enrollment.objects.filter(faculty=faculty)
        course_ids = enrollments.values_list('course', flat=True).distinct()
        courses = Course.objects.filter(id__in=course_ids)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class FacultyCourseStudentsView(APIView):
    def get(self, request, faculty_id, course_id):
        faculty = get_object_or_404(Faculty, id=faculty_id)
        course = get_object_or_404(Course, id=course_id)
        enrollments = Enrollment.objects.filter(faculty=faculty, course=course)
        student_ids = enrollments.values_list('student', flat=True).distinct()
        students = Student.objects.filter(id__in=student_ids)
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
