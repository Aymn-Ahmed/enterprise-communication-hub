using System;
using System.Collections.Generic;

namespace Whatsapp_Backend.ModelsScaffold;

public partial class Appointment
{
    public int Id { get; set; }

    public int DisplayId { get; set; }

    public int? CustomerId { get; set; }

    public string? CustomerName { get; set; }

    public string? Note { get; set; }

    public string? Location { get; set; }

    public string? Type { get; set; }

    public string? State { get; set; }

    public int Topic { get; set; }

    public double? Date { get; set; }

    public double? EndDate { get; set; } // التاريخ القادم (ComingDate)

    public string? Time { get; set; }

    public int BranchId { get; set; }

    public int? CreatedBy { get; set; }

    public int? ToUserId { get; set; }

    public double? CreatedDate { get; set; }

    public int? LastEditBy { get; set; }

    public double? LastEditDate { get; set; }

    public bool? Deleted { get; set; }

    public int? ProgressDays { get; set; }

    public bool Done { get; set; }

    public bool? IsCustomerQualified { get; set; }

    public bool? IsDealQualified { get; set; }

    public bool? IsTheOwner { get; set; }

    public int ComponySize { get; set; }

    public double? EnteringDate { get; set; }

    public string? CreatedDevice { get; set; }

    public string? EditDevice { get; set; }

    public DateTime CreatedDateD { get; set; }

    public DateTime? LastEditDateD { get; set; }

    public string? Status { get; set; } // 'upcoming', 'done', 'postponed'

    public int? Priority { get; set; } // 100, 50, 30

    // ✅ حقول بيانات العميل
    public string? NameHead { get; set; } // اسم المسؤول

    public int? CustomerType { get; set; } // نوع العميل (1=دائم, 2=محتمل, 3=مستهدف)

    public string? Country { get; set; } // الدولة

    public string? City { get; set; } // المدينة

    public string? ActivityName { get; set; } // النشاط

    public string? ActivityTypeName { get; set; } // نوع النشاط
}
