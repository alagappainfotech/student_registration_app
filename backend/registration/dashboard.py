import io
import base64
import seaborn as sns
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
from django.db.models import Count, Sum, Avg
from registration.models import (
    Organization, 
    Course, 
    Student, 
    Faculty, 
    Enrollment, 
    Grade
)

class SystemDashboard:
    @classmethod
    def generate_dashboard_data(cls):
        """
        Generate comprehensive dashboard data with visualizations
        """
        # Organization Data
        org_data = {
            'total_organizations': Organization.objects.count(),
            'internal_organizations': Organization.objects.filter(is_internal=True).count(),
        }

        # User Statistics
        user_data = {
            'total_students': Student.objects.count(),
            'total_faculty': Faculty.objects.count(),
            'students_by_organization': list(
                Student.objects.values('organization__name')
                .annotate(count=Count('id'))
            )
        }

        # Course Insights
        course_data = {
            'total_courses': Course.objects.count(),
            'total_course_fees': Course.objects.aggregate(total=Sum('fees'))['total'] or 0,
            'avg_course_fee': Course.objects.aggregate(avg=Avg('fees'))['avg'] or 0,
        }

        # Enrollment Analysis
        enrollment_data = {
            'total_enrollments': Enrollment.objects.count(),
            'enrollments_by_course': list(
                Enrollment.objects.values('course__name')
                .annotate(count=Count('id'))
                .order_by('-count')
            )
        }

        # Grade Distribution
        grade_data = {
            'grade_distribution': list(
                Grade.objects.values('value')
                .annotate(count=Count('id'))
                .order_by('value')
            )
        }

        # Visualizations
        visualizations = {
            'students_by_org_chart': cls._students_by_organization_chart(),
            'course_enrollment_chart': cls._course_enrollment_chart(),
            'grade_distribution_chart': cls._grade_distribution_chart(),
        }

        return {
            'org_data': org_data,
            'user_data': user_data,
            'course_data': course_data,
            'enrollment_data': enrollment_data,
            'grade_data': grade_data,
            'visualizations': visualizations
        }

    @classmethod
    def _students_by_organization_chart(cls):
        """Create pie chart of students by organization"""
        df = pd.DataFrame(
            Student.objects.values('organization__name')
            .annotate(count=Count('id'))
        )
        
        fig = px.pie(
            df, 
            names='organization__name', 
            values='count', 
            title='Students by Organization'
        )
        return fig.to_json()

    @classmethod
    def _course_enrollment_chart(cls):
        """Create bar chart of course enrollments"""
        df = pd.DataFrame(
            Enrollment.objects.values('course__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        fig = px.bar(
            df, 
            x='course__name', 
            y='count', 
            title='Course Enrollments'
        )
        return fig.to_json()

    @classmethod
    def _grade_distribution_chart(cls):
        """Create histogram of grade distribution"""
        df = pd.DataFrame(
            Grade.objects.values('value')
            .annotate(count=Count('id'))
        )
        
        fig = px.histogram(
            df, 
            x='value', 
            y='count', 
            title='Grade Distribution'
        )
        return fig.to_json()
